import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BoltIcon,
  ChatIcon,
  GridIcon,
  GroupIcon,
  HorizontaLDots,
  ListIcon,
  PencilIcon,
  PieChartIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { RootState } from "@/Store";
import Search from "./Search";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const MARKET: NavSection = {
  title: "Market",
  items: [
    { name: "Overview", icon: <GridIcon />, path: "/" },
    { name: "Open IPOs", icon: <BoltIcon />, path: "/ipo/open" },
    { name: "Compare IPOs", icon: <ListIcon />, path: "/ipo/compare" },
  ],
};

const USER: NavSection = {
  title: "My IPOs",
  items: [
    { name: "Dashboard", icon: <PieChartIcon />, path: "/user" },
    { name: "Profile", icon: <UserCircleIcon />, path: "/user/profile" },
  ],
};

const ADMIN: NavSection = {
  title: "Admin",
  items: [
    { name: "Dashboard", icon: <GridIcon />, path: "/admin" },
    { name: "Update IPO", icon: <PencilIcon />, path: "/admin/ipo" },
  ],
};

const HELP: NavSection = {
  title: "Help",
  items: [
    { name: "About Us", icon: <GroupIcon />, path: "/about-us" },
    { name: "Support", icon: <ChatIcon />, path: "/support" },
  ],
};

const AppSidebar: React.FC = () => {
  const roles = useSelector((state: RootState) => state.auth.roles);
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const showLabels = isExpanded || isHovered || isMobileOpen;
  const collapsed = !isExpanded && !isHovered;

  const sections: NavSection[] = [
    MARKET,
    ...(roles.includes("ROLE_USER") ? [USER] : []),
    ...(roles.includes("ROLE_ADMIN") ? [ADMIN] : []),
    HELP,
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-5 lg:py-8 flex ${
          collapsed ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link className="hidden lg:block" to="/">
          {showLabels ? (
            <>
              <img
                className="dark:hidden"
                src="/images/logo/logo-name.png"
                alt="VirtuStock"
                width={200}
                height={50}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-name-dark.png"
                alt="VirtuStock"
                width={200}
                height={50}
              />
            </>
          ) : (
            <img
              src="/images/logo/logo-icon.png"
              alt="VirtuStock"
              width={25}
              height={30}
            />
          )}
        </Link>

        <div className="lg:hidden overflow-hidden">
          <Search />
        </div>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6 flex flex-col gap-6" aria-label="Main navigation">
          {sections.map((section) => (
            <div key={section.title}>
              <h2
                className={`mb-3 flex text-xs uppercase leading-[20px] text-gray-400 ${
                  collapsed ? "lg:justify-center" : "justify-start"
                }`}
              >
                {showLabels ? (
                  section.title
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              <ul className="flex flex-col gap-1.5">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      title={item.name}
                      aria-current={isActive(item.path) ? "page" : undefined}
                      className={`menu-item group ${
                        isActive(item.path)
                          ? "menu-item-active"
                          : "menu-item-inactive"
                      } ${collapsed ? "lg:justify-center" : "lg:justify-start"}`}
                    >
                      <span
                        className={`menu-item-icon-size ${
                          isActive(item.path)
                            ? "menu-item-icon-active"
                            : "menu-item-icon-inactive"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {showLabels && (
                        <span className="menu-item-text">{item.name}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
