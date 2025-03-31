import { createBrowserRouter } from "react-router";
import Layout from "./layout";
import Home from "./home/home";
import NotFound from "./not-found";

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
    ],
  },
]);

export default router;
