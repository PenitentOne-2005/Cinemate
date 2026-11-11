import { Suspense } from "react";
import HomeData from "./HomeData";
import { Loader } from "../components";

const Page = () => {
  return (
    <Suspense fallback={<Loader />}>
      <HomeData />
    </Suspense>
  );
};

export default Page;
