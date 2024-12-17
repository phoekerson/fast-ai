import Stripe from "stripe";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { error } from "console";
import { createOrUpdateSubscription, createOrUpdateUser, updateUserPoints } from "@/utils/db/action";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion:"2024-10-28.acacia",
});

    export async function POST(req:Request) {
        const body = await req.text();
        const signature = (await headers()).get("Stripe-signature") as string;

        if(!signature){
            console.error("No stripe signature found");
            return NextResponse.json({ error: "No Stripe signature"}, {status: 400})
        }
        let event: Stripe.Event;
        try {
            event = stripe.webhooks.constructEvent(body,
                signature,
                process.env.STRIPE_WEBHOOKS_SECRET!);
        } catch(err:any){
            console.error(`Webhook signature verification failed: ${err.message}`);
            return NextResponse.json(
                {error: `Webhook Error: ${err.message}`},
                { status:400}
            );
        }
        if(event.type === 'checkout.session.completed'){
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.client_reference_id;
            const subscriptionId = session.subscription as string;
            if(!userId || !subscriptionId){
                console.error("Missing userId or SubscriptionId in session", { session })
                return NextResponse.json(
                    { error: "Invalid session data"},
                    { status: 400}
                );
            } try {
                const subscription = await stripe.subscriptions.retrieve(subscriptionId)
                if(!subscription.items.data.length){
                    console.error("No items found in subscriptipn", {subscription});
                    return NextResponse.json(
                        {error: "Invalid subscription data"},
                        {status: 400}
                    );
                }
                const priceId = subscription.items.data[0].price.id;

                let plan: string;
                let pointsToAdd: number;

             switch (priceId){
                case "price_1QJCUTDRtsqC0bGMTnPT8rUK":
                    plan = "Basic";
                    pointsToAdd = 100;
                    break;
                
                case "price_1QJCfdDRtsqC0bGMhQjjgFgB":
                    plan = "Pro";
                    pointsToAdd = 500;
                    break;
                default:
                    console.error("Unknown price ID", {priceId});
                    return NextResponse.json(
                        { error: "Unkwown price ID"},
                        {status: 400}
                    );
             }
              const updateSubscription = await createOrUpdateSubscription(
                userId,
                subscriptionId,
                plan,
                "active",
                new Date(subscription.current_period_start * 1000),
                new Date(subscription.current_period_end * 1000)
              );
              if(!updateSubscription){
                console.error('Failed to create or update subscription');
                return NextResponse.json(
                    { error: "Failed to create or update subscription" },
                    { status: 500 }
                );
              }
              await updateUserPoints(userId, pointsToAdd)
            } catch (error: any) {
                console.error("Error processing subscription", error);
                return NextResponse.json(
                    {
                        error:"Error processing subscription", details: error.message},
                        { status: 500}
                );

            }
        }
        return NextResponse.json({ received: true}); 
    }