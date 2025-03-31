import { createBrowserRouter } from "react-router";
import Layout from "./layout";
import Home from "./home/home";
import NotFound from "./not-found";
import Batching from "./batching/batching";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: (
      <Layout>
        <NotFound />
      </Layout>
    ),
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "batch",
        element: <Batching />,
      },
    ],
  },
]);

export default router;
