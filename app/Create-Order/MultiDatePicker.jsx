import React from "react";
import {DateRangePicker} from "@nextui-org/date-picker";

export default function MultiDatePicker() {

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
      <DateRangePicker
            key="outside-left"
            label="Stay duration"
            labelPlacement="outside-left"
            description="outside-left"
          />
      </div>  
    </div>  
  );
}
