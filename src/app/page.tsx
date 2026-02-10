"use client";

import { useEffect, useState } from "react";
import ServicesCombobox from "./components/ServicesCombobox";
import RegionsCombobox from "./components/RegionsCombobox";
import {
  Offers,
  Regions,
  PricingData,
  PriceDimensions,
  baseAWSUrl,
  offersAWSUrl,
} from "@/app/utils";

export default function Home() {
  const [offers, setOffers] = useState<Offers | null>(null);

  const [selectedService, setSelectedService] = useState("");
  const [prevSelectedService, setPrevSelectedService] = useState("");

  const [regions, setRegions] = useState<Regions | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [prevSelectedRegion, setPrevSelectedRegion] = useState("");
  const [regionsInfo, setRegionsInfo] = useState<Regions | null>(null);

  const [pricingData, setPricingData] = useState<PricingData | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermError, setSearchTermError] = useState("");

  const [offerDetails, setOfferDetails] = useState<React.JSX.Element[]>([]);
  const [priceDimension, setPriceDimension] =
    useState<React.JSX.Element | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    /** Fetch Offers data */
    fetch(baseAWSUrl + offersAWSUrl)
      .then((response) => {
        response.json().then((data) => {
          setOffers(data);
        });
      })
      .catch((error) => {
        setError(error);
        console.error(error);
      });

    /** Fetch regions mapping */
    fetch("regions_info.json")
      .then((response) => {
        response.json().then((data) => {
          setRegionsInfo(data);
        });
      })
      .catch((error) => {
        setError(error);
        console.error(error);
      });
  }, []);

  /** Fetch Regions for selected service */
  useEffect(() => {
    if (!selectedService || !offers || !regionsInfo) return;

    const regionURL = offers.offers[selectedService]["currentRegionIndexUrl"];

    fetch(baseAWSUrl + regionURL)
      .then((response) => {
        response.json().then((data) => {
          const newData = {} as Regions;
          Object.keys(data.regions).forEach((key) => {
            const d = {
              name: regionsInfo[key].name,
              code: key,
              currentVersionUrl: data.regions[key].currentVersionUrl,
            };
            newData[key] = d;
          });
          console.log(newData);
          
          setRegions(newData);
        });
      })
      .catch((error) => {
        setError(error);
        console.error(error);
      });
  }, [selectedService, offers, regionsInfo]);

  /** Fetch service pricing data for selected region and service */
  useEffect(() => {
    console.log(selectedRegion);
    
    if (!selectedRegion) return;
    fetch(baseAWSUrl + regions![selectedRegion]["currentVersionUrl"])
      .then((response) => {
        response.json().then((data) => {
          setPricingData(data);
        });
      })
      .catch((error) => {
        setError(error);
        console.error(error);
      });
  }, [selectedRegion, regions]);

  if (prevSelectedService != selectedService) {
    setPrevSelectedService(selectedService);
    setSelectedRegion("");
    setSearchTerm("");
    setSearchTermError("");
    setOfferDetails([]);
    setPriceDimension(null);
    setPricingData(null);
  }

  if (prevSelectedRegion != selectedRegion) {
    setPrevSelectedRegion(selectedRegion);
    setSearchTerm("");
    setSearchTermError("");
    setOfferDetails([]);
    setPriceDimension(null);
    setPricingData(null);
  }

  const validateRateCode = (val: string) => {
    // prettier-ignore
    return /^[a-zA-Z0-9]{5,20}\.[a-zA-Z0-9]{5,20}\.[a-zA-Z0-9]{5,20}$/ig.test(val);
  };

  const handleConfirm = () => {
    if (pricingData === null) {
      setSearchTermError("Pricing data not laoaded yet.");
      return;
    }

    if (searchTermError === "" && validateRateCode(searchTerm)) {
      const [sku, offerTerm, priceDimension] = searchTerm.split(".");
      const list: React.JSX.Element[] = [];
      if (pricingData.products[sku]?.attributes === undefined) {
        setSearchTermError("Sku not found! Check service or region.");
        return;
      }
      for (const [key, value] of Object.entries(
        pricingData.products[sku].attributes,
      )) {
        list.push(
          <li key={key} className="my-3">
            <span className="font-bold capitalize">{key}</span>: {value}
          </li>,
        );
      }

      setOfferDetails(list);

      // prettier-ignore
      let pd: PriceDimensions | undefined;

      for (const offerType of ["OnDemand", "Reserved"]) {
        // prettier-ignore
        pd = pricingData.terms[offerType]?.[sku]?.[sku + "." + offerTerm]?.["priceDimensions"]?.[sku + "." + offerTerm + "." + priceDimension];

        if (pd !== undefined) break;
      }

      if (pd === undefined) {
        setSearchTermError("RateCode not found! Check service or region.");
        return;
      }

      const prices = Object.keys(pd.pricePerUnit).map((key, index) => (
        <li key={"pdp" + index} className="my-3">
          <span className="font-bold capitalize">pricePerUnit</span>:
          {` ${pd.pricePerUnit[key]} ${key}`}
        </li>
      ));

      setPriceDimension(
        <>
          <li key={"pd1"} className="my-3">
            <span className="font-bold capitalize">description</span>:{" "}
            {pd.description}
          </li>
          <li key={"pd2"} className="my-3">
            <span className="font-bold capitalize">Tier</span>:{" "}
            {`${pd.beginRange} - ${pd.endRange}`}
          </li>
          <li key={"pd3"} className="my-3">
            <span className="font-bold capitalize">unit</span>: {pd.unit}
          </li>
          {prices}
        </>,
      );
    } else {
      setOfferDetails([]);
      setPriceDimension(null);
      setSearchTermError("RateCode not valid!");
    }
  };

  return (
    <div className="w-1/2 mx-auto mt-10 p-20 rounded-2xl bg-gray-100">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-center">AWS RateCode Checker</h1>
        <ServicesCombobox
          offers={offers}
          selectedService={selectedService}
          setSelectedService={setSelectedService}
        />
        {error && <p>{error.message}</p>}
        <RegionsCombobox
          regions={regions}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          disabled={!selectedService}
        />
        <div className="mt-8">
          <h2 className="capitalize my-2 flex column gap-3 justify-left items-center font-bold">
            Enter RateCode
            {selectedRegion && !pricingData && (
              <span className="flex flex-row gap-2 text-sm ml-auto mr-3">
                loading product info...
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </span>
            )}
          </h2>
          <input
            type="search"
            name="ratecode"
            disabled={!selectedRegion || !pricingData}
            required
            className={`w-full border bg-white disabled:border-gray-400 rounded-xl px-5 py-2 mb-3 ${searchTermError && "focus:outline-red-700 border-red-700 text-red-500"}`}
            placeholder="RACFGSRGMXAJUC8H.JRTCKXETXF.6YS6EN2CT7"
            value={searchTerm}
            onChange={(e) => {
              if (offerDetails.length !== 0) {
                setOfferDetails([]);
                setPriceDimension(null);
              }

              setSearchTerm(e.target.value.toUpperCase());

              if (
                e.target.value.length > 30 &&
                !validateRateCode(e.target.value)
              ) {
                setSearchTermError("Wrong rate code format");
              } else {
                setSearchTermError("");
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleConfirm();
              }
            }}
          />
          {searchTermError && <p className="text-red-600">{searchTermError}</p>}
        </div>
      </div>
      <div className="mt-5">
        <h2 className="text-2xl font-bold mb-3">Results</h2>
        <div
          className={`border rounded-xl bg-white min-h-50 p-5 ${offerDetails.length == 0 && "border-dashed border-gray-500"}`}
        >
          {offerDetails.length !== 0 && (
            <>
              <h2 className="font-bold text-xl mt-3 underline">
                Product Details
              </h2>
              <ul className="list-disc pl-3">{offerDetails}</ul>
            </>
          )}
          {priceDimension && (
            <>
              <h2 className="font-bold text-xl mt-5 underline">Offer Terms</h2>
              <ul className="list-disc pl-3">{priceDimension}</ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
