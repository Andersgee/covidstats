import type { GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useId, useState } from "react";
import { Chart } from "../components/Chart";
import { SEO } from "../components/SEO";
import { getSweCovidData, type CovidData } from "../utils/covid";

type Props = {
  covidData: CovidData;
};

const Page: NextPage<Props> = ({ covidData }) => {
  const router = useRouter();
  const selectId = useId();
  const queryregion = router.query.region;
  const [selectedRegion, setSelectedRegion] = useState("Sweden");

  useEffect(() => {
    const region = typeof queryregion === "string" ? queryregion : "Sweden";
    if (region in covidData) {
      setSelectedRegion(region);
    }
  }, [queryregion]);

  const handleChange = (r: string) => {
    router.push({
      pathname: "/",
      query: { region: r },
    });
    setSelectedRegion(r);
  };

  return (
    <>
      <SEO
        url="/"
        title="covid stats"
        description="Simple overview of covid cases in Sweden"
        image="/images/share.png"
      />
      <div className="container flex flex-col items-center px-2">
        <h1 className="my-10">Covid stats - How many had it?</h1>
        <div className="flex items-baseline">
          <label htmlFor={selectId} className="mr-1">
            Region
          </label>
          <select
            id={selectId}
            value={selectedRegion}
            onChange={(e) => handleChange(e.target.value)}
            className="bg-white p-2 text-black dark:bg-black dark:text-white"
          >
            {Object.keys(covidData).map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
        <Chart data={covidData[selectedRegion]} />
      </div>
    </>
  );
};

export default Page;

//////////////////////////
// props

export const getStaticProps: GetStaticProps = () => {
  try {
    const covidData = getSweCovidData();
    const props: Props = { covidData };
    return {
      props,
      //revalidate: 60 * 60 * 24,
    };
  } catch (error) {
    throw new Error("something went wrong");
  }
};
