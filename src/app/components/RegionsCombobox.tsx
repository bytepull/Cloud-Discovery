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
import { Regions } from "@/app/utils";

interface RegionsComboboxProps {
  regions: Regions | null;
  selectedRegion: string;
  setSelectedRegion: React.Dispatch<React.SetStateAction<string>>;
  disabled: boolean;
}

export default function ServicesCombobox({
  regions,
  selectedRegion,
  setSelectedRegion,
  disabled,
}: RegionsComboboxProps) {
  const [query, setQuery] = useState<string>("");

  /** filteredRegions = ["us-east-1", "us-east-2", ...]  */
  const filteredRegions = regions
    ? query === ""
      ? Object.keys(regions)
      : Object.keys(regions).filter((region) => {
          return (
            region.toLowerCase().includes(query.toLowerCase()) ||
            regions[region].name.toLowerCase().includes(query.toLowerCase())
          );
        })
    : [];

  return (
    <div className="mt-8">
      <h2 className="capitalize my-2 flex column gap-3 justify-left items-center font-bold">
        select region
        {!disabled && !regions && (
          <span className="flex flex-row gap-2 text-sm ml-auto mr-3">
            loading regions info...
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </span>
        )}
      </h2>
      <Combobox
        key={selectedRegion}
        value={selectedRegion}
        onChange={(value) => {
          setSelectedRegion(value!);
        }}
        onClose={() => setQuery("")}
        // __demoMode
      >
        <div className="relative">
          <ComboboxInput
            className={clsx(
              "w-full rounded-lg border disabled:border-gray-400 py-1.5 pr-8 pl-3 text-sm/6 bg-white",
              "focus:not-data-focus:outline-none data-focus:outline-2 data-focus:-outline-offset-2 data-focus:outline-white/25",
            )}
            displayValue={(value) =>
              value
                ? (regions?.[value.toString()]?.["name"] ?? "") +
                  " - " +
                  value.toString()
                : ""
            }
            disabled={disabled}
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
          {filteredRegions.map((item, index) => (
            <ComboboxOption
              key={index}
              value={item}
              className="group flex cursor-default items-center gap-2 mx-4 last:border-none border-b border-b-black/50 px-3 py-1.5 select-none data-focus:bg-gray-100"
            >
              <CheckIcon className="invisible size-4 group-data-selected:visible" />
              <div className="text-sm/6 flex flex-row flex-1">
                <div>{regions![item].name}</div>
                <div className="ml-auto">{item}</div>
              </div>
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}
