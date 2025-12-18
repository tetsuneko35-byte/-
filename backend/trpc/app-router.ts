import { createTRPCRouter } from "./create-context";
import { paymentRouter } from "./routes/payment";

export const appRouter = createTRPCRouter({
  payment: paymentRouter,
});

export type AppRouter = typeof appRouter;
