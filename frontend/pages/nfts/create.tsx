import { useState } from "react";
import { NextPage } from "next";
import { NFTStorage, File } from "nft.storage";
import { useForm, SubmitHandler } from "react-hook-form";
import { Button, FileDropzone, Layout } from "../../components";

type Inputs = {
  name: string;
  description: string;
  image: File;
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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async ({
    name,
    description,
    image,
  }) => {
    setLoading(true);
    try {
      const metadata = await client.store({
        name,
        description,
        image: new File([image], image.name, { type: image.type }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/nft/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            description,
            image: metadata.ipnft,
          }),
        }
      );

      const data = await response.json();
      console.log(data);
    } catch (error: any) {
      console.error(error);
      setError(error.message);
    }
    return setLoading(false);
  };

  return (
    <Layout>
      <div className="grid h-screen place-items-center">
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
      </div>
    </Layout>
  );
};

export default Create;
