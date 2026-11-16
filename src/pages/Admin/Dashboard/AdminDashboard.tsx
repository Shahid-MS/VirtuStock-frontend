import Count from "./Components/Count";
import Users from "./Components/Users";
import Registrars from "./Components/Registrars";

const AdminDashboard = () => {
  return (
    <>
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <Count />
        </div>

        <div className="col-span-12">
          <Users />
        </div>

        <div className="col-span-12">
          <Registrars />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
