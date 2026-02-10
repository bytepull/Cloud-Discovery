"use client";

import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { useState } from "react";
import { Offers } from "@/app/utils";

interface ServicesComboboxProps {
  offers: Offers | null;
  selectedService: string;
  setSelectedService: React.Dispatch<React.SetStateAction<string>>;
}

export default function ServicesCombobox({
  offers,
  selectedService,
  setSelectedService,
}: ServicesComboboxProps) {
  const [query, setQuery] = useState<string>("");

  /** filteredServices = ["comprehend", "AmazonMWAA", ...] */
  const filteredServices = (
    offers
      ? query === ""
        ? Object.keys(offers["offers"])
        : Object.keys(offers["offers"]).filter((item) => {
            return item.toLowerCase().includes(query.toLowerCase());
          })
      : []
  ).sort((a, b) => {
    if (a.toLowerCase() < b.toLowerCase()) return -1;
    if (a.toLowerCase() > b.toLowerCase()) return 1;
    return 0;
  });

  return (
    <div className="mt-8">
      <h2 className="capitalize my-2 flex column gap-3 justify-left items-center font-bold">
        select service
        {!offers && (
          <span className="flex flex-row gap-2 text-sm ml-auto mr-3">
            loading offers info...
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </span>
        )}
      </h2>
      <Combobox
        value={selectedService}
        onChange={(value) => setSelectedService(value ?? "")}
        onClose={() => setQuery("")}
        // __demoMode
      >
        <div className="relative">
          <ComboboxInput
            className={clsx(
              "w-full rounded-lg border py-1.5 pr-8 pl-3 text-sm/6 bg-white",
              "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25",
            )}
            displayValue={(value) => (value ? value.toString() : "")}
            onChange={(event) => setQuery(event.target.value)}
          />
          <ComboboxButton className="group absolute inset-y-0 right-0 px-2.5">
            <ChevronDownIcon className="size-4 fill-black/70  group-data-hover:fill-black" />
          </ComboboxButton>
        </div>

        <ComboboxOptions
          anchor="bottom"
          transition
          className={clsx(
            "w-(--input-width) rounded-xl bg-white border border-black p-1 [--anchor-gap:--spacing(1)] empty:invisible",
            "transition duration-100 ease-in data-leave:data-closed:opacity-0",
          )}
        >
          {filteredServices?.map((item, index) => (
            <ComboboxOption
              key={index}
              value={item}
              className="group flex cursor-default items-center gap-2 mx-4 last:border-none border-b border-b-black/50 px-3 py-1.5 select-none data-focus:bg-gray-100"
            >
              <CheckIcon className="invisible size-4 group-data-selected:visible" />
              <div className="text-sm/6">
                {item.replace(/((^Amazon)|(^AWS)|(^aws))(.+)/g, "$1 $5")}
              </div>
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}
