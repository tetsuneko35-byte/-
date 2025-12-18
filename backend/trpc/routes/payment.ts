import * as z from "zod";
import Stripe from "stripe";
import { createTRPCRouter, publicProcedure } from "../create-context";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-12-15.clover",
});

export const paymentRouter = createTRPCRouter({
  createCheckoutSession: publicProcedure
    .input(
      z.object({
        plan: z.enum(["monthly", "yearly", "lifetime"]),
        successUrl: z.string(),
        cancelUrl: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      console.log("Creating checkout session for plan:", input.plan);

      const priceMap = {
        monthly: {
          amount: 98000,
          interval: "month" as const,
          name: "月額プラン",
        },
        yearly: {
          amount: 880000,
          interval: "year" as const,
          name: "年額プラン",
        },
        lifetime: {
          amount: 1980000,
          interval: null,
          name: "買い切りプラン",
        },
      };

      const planDetails = priceMap[input.plan];

      try {
        const sessionParams: Stripe.Checkout.SessionCreateParams = {
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "jpy",
                product_data: {
                  name: `薬剤師国家試験アプリ - ${planDetails.name}`,
                  description: "広告なし・全問題アクセス・詳細な統計",
                },
                unit_amount: planDetails.amount,
                ...(planDetails.interval && {
                  recurring: {
                    interval: planDetails.interval,
                  },
                }),
              },
              quantity: 1,
            },
          ],
          mode:
            input.plan === "lifetime" ? "payment" : "subscription",
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          metadata: {
            plan: input.plan,
          },
        };

        const session = await stripe.checkout.sessions.create(sessionParams);

        console.log("Checkout session created:", session.id);

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        console.error("Stripe error:", error);
        throw new Error("Failed to create checkout session");
      }
    }),

  verifyPayment: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const session = await stripe.checkout.sessions.retrieve(
          input.sessionId
        );

        if (session.payment_status === "paid") {
          const plan = session.metadata?.plan as
            | "monthly"
            | "yearly"
            | "lifetime";

          return {
            success: true,
            plan,
            expiryDate:
              plan === "lifetime"
                ? null
                : plan === "monthly"
                  ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                  : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          };
        }

        return {
          success: false,
          plan: null,
          expiryDate: null,
        };
      } catch (error) {
        console.error("Payment verification error:", error);
        return {
          success: false,
          plan: null,
          expiryDate: null,
        };
      }
    }),
});
