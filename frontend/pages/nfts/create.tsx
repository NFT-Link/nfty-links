import { useEffect, useState } from "react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { NFTStorage, File } from "nft.storage";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Button,
  Checkbox,
  FileDropzone,
  Layout,
  Select,
  Modal,
} from "../../components";
import Link from "next/link";

type Inputs = {
  name: string;
  description: string;
  image: File;
  chain: string;
  maxClaims: number
};

declare const process: {
  env: {
    NEXT_PUBLIC_NFT_STORAGE_API_KEY: string;
    NEXT_PUBLIC_API_URL: string;
  };
};

const client = new NFTStorage({
  token: process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY,
});

const Create: NextPage = () => {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [authToken, setAuthToken] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Inputs>();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
    }
  }, [errors]);

  const onSubmit: SubmitHandler<Inputs> = async ({
    name,
    description,
    image,
    maxClaims
  }) => {
    setLoading(true);
    try {
      const metadata = await client.store({
        name,
        description,
        image: new File([image], image.name, { type: image.type }),
      });

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}nft/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name,
          description,
          image: metadata.ipnft,
          maxClaims,
        }),
      });

      setShowSuccessModal(true);
    } catch (error: any) {
      console.error(error);
      setError(error.message);
    }

    return setLoading(false);
  };

  return (
    <Layout>
      {showSuccessModal && (
        <Modal open={showSuccessModal}>
          <div className="p-4 text-center">
            <h1 className="mb-4 text-4xl font-bold">Success ✅</h1>
            <p className="text-xl">Successfully created NFT!</p>
            <div className="flex items-center justify-end p-3 mt-1">
              <button
                className="px-6 py-2 mb-1 text-sm font-semibold text-red-500 uppercase"
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  return router.push("/nfts");
                }}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      <div className="grid pt-40 place-items-center">
        <form
          className="px-8 pb-8 bg-white rounded shadow-xl w-96"
          onSubmit={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          <div className="mb-6">
            <h1 className="flex justify-center mb-8 text-4xl">
              Create New NFT
            </h1>

            <label
              className="block mb-2 text-lg font-bold text-gray-700"
              htmlFor="name"
            >
              Name
            </label>
            <input
              className="w-full px-5 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="Enter image name..."
              {...register("name", { required: true })}
            />
            {errors.name && (
              <span className="text-sm text-red-500">Name is required</span>
            )}
          </div>

          <div className="mb-6">
            <label
              className="block mb-2 text-lg font-bold text-gray-700 "
              htmlFor="description"
            >
              Description
            </label>
            <input
              className="w-full px-5 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
              id="description"
              type="text"
              placeholder="Enter image description..."
              {...register("description", { required: true })}
            />
            {errors.description && (
              <span className="text-sm text-red-500">
                Description is required
              </span>
            )}
          </div>

          <div className="mb-6">
            <label
              className="block mb-2 text-lg font-bold text-gray-700 "
              htmlFor="description"
            >
              Maximum Number of claims
            </label>
            <input
              className="w-full px-5 py-2 leading-tight text-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
              id="maxClaims"
              type="number"
              placeholder="Max number of NFTs"
              {...register("maxClaims", { required: true })}
            />
            {errors.maxClaims && (
              <span className="text-sm text-red-500">
                Max claims is required
              </span>
            )}
          </div>

          <div className="mb-6">
            <label
              className="block mb-2 text-lg font-bold text-gray-700 "
              htmlFor="description"
            >
              Chain
            </label>
            <Select
              options={["Ethereum", "Polygon", "Avalanche"]}
              // {...register("chain")}
            />
            {errors.chain && (
              <span className="text-sm text-red-500">Chain is required</span>
            )}
          </div>

          <div className="mb-6">
            <div className="form-check">
              <label
                className="block mb-2 text-lg font-bold text-gray-700 "
                htmlFor="description"
              >
                Publish to Marketplace
              </label>
              <Checkbox label="OpenSea" />
              <Checkbox label="Rarible" />
              <Checkbox label="Zora" />
            </div>
          </div>

          <div className="mb-10">
            <label
              className="block mb-2 text-lg font-bold text-gray-700 "
              htmlFor="image"
            >
              Image
            </label>
            <FileDropzone name="image" control={control} />
            {errors.image && (
              <span className="text-sm text-red-500">Image is required</span>
            )}
          </div>
          {error && (
            <span className="text-sm text-red-500">{`Error: ${error}`}</span>
          )}

          <Button type="submit" loading={loading}>
            Submit
          </Button>
        </form>
        <div className="mt-8">
          <Link href="/nfts" passHref>
            <a>
              <Button>{"View All NFT's"}</Button>
            </a>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default Create;
