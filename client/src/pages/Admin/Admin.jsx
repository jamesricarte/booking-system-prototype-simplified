import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <main className="container w-full h-full bg-white">
      <div className="p-4">
        <h1 className="text-xl">Dashboard Section</h1>
      </div>
      <hr />
      <div className="pt-7 px-14">
        <div className="grid grid-cols-2 gap-8">
          <Link className="shadow-md p-36 bg-[#F5F5F5] flex items-center justify-center rounded-lg text-[27px] text-center">
            System Summary
          </Link>
          <Link className="shadow-md p-36 bg-[#F5F5F5] flex items-center justify-center rounded-lg text-[27px]">
            Latest Booking Activities
          </Link>
          <Link className="shadow-md p-36  bg-[#F5F5F5] flex items-center justify-center rounded-lg text-[27px]">
            Upcoming Schedules
          </Link>
          <Link className="shadow-md  p-36  bg-[#F5F5F5] flex items-center justify-center rounded-lg text-[27px] text-center">
            Reports
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
