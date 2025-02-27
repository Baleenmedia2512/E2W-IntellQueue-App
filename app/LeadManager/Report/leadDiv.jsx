import { Clock, Globe, Phone, RefreshCcw, User, Calendar, Briefcase } from "lucide-react";

const Leaddiv = ({ lead, index }) => {
  const tatClass =
    lead.tat === null
      ? "bg-gray-50 text-gray-700"
      : lead.tat <= 24
      ? "bg-green-50 text-green-700"
      : lead.tat <= 72
      ? "bg-yellow-50 text-yellow-700"
      : "bg-red-50 text-red-700";

  const dotClass =
    lead.tat === null
      ? "bg-gray-500"
      : lead.tat <= 24
      ? "bg-green-500"
      : lead.tat <= 72
      ? "bg-yellow-500"
      : "bg-red-500";

  const displayTAT = lead.tat === null ? "Unattended" : `${lead.tat}h`;

  return (
    <div className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl border">
      <div className="md:p-6 p-2">
        {/* Header Section */}
        <div className="flex justify-between items-center md:mb-6 mb-4">
          <div className="flex items-center">
            <span className="bg-blue-50 text-blue-700 font-semibold px-4 py-1.5 rounded-full md:text-base text-sm text-nowrap">
              Lead #{index + 1}
            </span>
          </div>
          <div className="flex items-center md:gap-3 gap-1">
            <span className="text-black px-2  md:px-4 py-1.5 rounded-full md:text-base text-sm text-nowrap border font-medium whitespace-nowrap flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              {lead.date}
            </span>
            <span className="text-black px-2 md:px-4 py-1.5 rounded-full md:text-base text-sm text-nowrap border font-medium whitespace-nowrap flex items-center gap-2">
              <Clock className="w-3 h-3" />
              {lead.time}
            </span>
          </div>
        </div>

        {/* Status + Handled By Section */}
        <div className="md:mb-6 mb-4">
          <div className={`flex justify-between items-center px-4 py-3 rounded-lg ${tatClass}`}>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full animate-pulse ${dotClass}`}></div>
                <span className="font-semibold">{lead.status}</span>
              </div>
              {/* Handled By Info (inline) */}
              <div className="flex items-center gap-2 text-xs font-medium mt-1">
                <Briefcase className="w-3 h-3" /> Handled by: {lead.handledBy || "N/A"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">TAT: {displayTAT}</span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:gap-4 gap-2">
          {[
            {
              icon: <User className="w-4 h-4 text-gray-500" />,
              label: "Name",
              value: lead.name,
            },
            {
              icon: <Globe className="w-4 h-4 text-gray-500" />,
              label: "Platform",
              value: lead.platform,
            },
            {
              icon: <Phone className="w-4 h-4 text-gray-500" />,
              label: "Phone",
              value: lead.phoneNumber,
            },
            {
              icon: <RefreshCcw className="w-4 h-4 text-gray-500" />,
              label: "Previous Status",
              value: lead.previousStatus,
            },
            {
              icon: <Clock className="w-4 h-4 text-gray-500" />,
              label: "Status Changed",
              value: lead.statusChangedTime,
            },
            {
              icon: <Calendar className="w-4 h-4 text-gray-500" />,
              label: "Change Date",
              value: lead.statusChangeDate,
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start space-x-3 p-4 bg-gray-100 rounded-lg">
              <div className="mt-1">{item.icon}</div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                <p className="font-medium text-gray-900">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaddiv;
