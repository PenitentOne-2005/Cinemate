import { Suspense } from "react";
import HomeData from "./HomeData";

const Page = () => {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <HomeData />
    </Suspense>
  );
};

export default Page;
