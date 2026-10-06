import { Link } from "react-router";

import { INRFormat } from "../../Helper/INRHelper";
import { dateandTimeFormat } from "../../Helper/dateHelper";
import { latestGmp } from "../../Helper/ipoHelper";
import { IPOProps } from "../../Interface/IPO";

export default function GMPHeader({ ipo }: IPOProps) {
  const latest = latestGmp(ipo?.gmp);
  return (
    <>
      <div className="p-3 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col lg:gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-center w-full lg:gap-6 lg:flex-row">
            <div className=" w-15 h-10 lg:w-20 lg:h-20 overflow-hidden lg:border lg:border-gray-200 lg:rounded-full dark:border-gray-800">
              <Link to={`/ipo/${ipo?.id}`}>
                <img
                  className="w-full h-full object-contain"
                  src={ipo?.logo}
                  alt={ipo?.name}
                />
              </Link>
            </div>
            <div className="order-2">
              <h4 className="lg:mb-2 lg:text-lg font-semibold text-center text-gray-800 dark:text-white/90 lg:text-left">
                {ipo?.name}
              </h4>
              <div className=" hidden lg:flex flex-col items-center text-center lg:flex-row lg:gap-3 lg:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {ipo?.symbol}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 lg:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {ipo?.status}
                </p>
              </div>
            </div>
            <div className="lg:flex items-center order-3 gap-2 grow justify-end">
              <div>
                <p className="text-sm text-center lg:text-2xl font-medium text-gray-800 dark:text-white/90">
                  GMP: {latest ? INRFormat(latest.gmp) : "—"}
                </p>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {latest
                    ? `Last Updated : ${dateandTimeFormat(latest.lastUpdated)}`
                    : "GMP hasn't been published yet"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
