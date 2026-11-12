import { Suspense } from "react";
import HomeData from "./HomeData";
import { Loader } from "../shared/components";

const Page = () => {
  return (
    <Suspense fallback={<Loader />}>
      <HomeData />
    </Suspense>
  );
};

export default Page;
