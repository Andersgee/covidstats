import type { GetStaticProps, NextPage } from "next";

type Props = {
  data: number;
};

const Page: NextPage<Props> = ({ data }) => {
  return <div>lala {data}</div>;
};

export default Page;

//////////////////////////
// props

export const getStaticProps: GetStaticProps = async () => {
  try {
    const props: Props = { data: 99 };
    return {
      props,
      revalidate: 60,
    };
  } catch (error) {
    throw new Error("something went wrong");
  }
};
