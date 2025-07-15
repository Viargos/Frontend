import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";

export default function Home() {
  return (
    <>
      <main>
        <div className="flex justify-between">
          <div className="">
            <LeftSidebar />
          </div>
          <div className="">
            <h1>Hi, Vraj</h1>
          </div>
          <div className="">
            <RightSidebar />
          </div>
        </div>
      </main>
    </>
  );
}
