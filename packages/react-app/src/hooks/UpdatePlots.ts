import { toast } from "react-toastify";
import { fetchPlotMetadata } from "../data";
import { Plot } from "../models/Plot";

const useUpdatePlots = async (readContracts: any, DEBUG = false) => {
  const newPlots: Plot[] = [];
  if (readContracts) {
    try {
      const plotIds = await readContracts.CityDaoParcel.getPlotIds();
      const plotURIs = await readContracts.CityDaoParcel.getPlotURIs();
      for (let index = 0; index < plotIds.length; index++) {
        const plotId = plotIds[index];
        const ipfsHash = plotURIs[index];
        const isSold = await readContracts.CityDaoParcel.isSold(plotId);
        const price = !isSold ? await readContracts.CityDaoParcel.getPrice(plotId) : undefined;
        const owner = isSold ? await readContracts.CityDaoParcel.ownerOf(plotId) : undefined;
        try {
          const jsonManifestBuffer = await fetchPlotMetadata(ipfsHash);
          const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
          newPlots.push({
            id: plotId.toNumber(),
            parcel: 0,
            uri: ipfsHash,
            price: price,
            sold: isSold,
            owner: owner,
            ...jsonManifest,
          });
        } catch (e) {
          toast.error("Failed to read plot metadata. Please try again or contact CityDAO support.", {
            className: "error",
          });
          DEBUG && console.log(e);
        }
      }
    } catch (e) {
      toast.error(
        `Failed to find CityDAO's contract. Make sure you're on the ${process.env.REACT_APP_NETWORK} network.`,
        {
          toastId: "contract-fail",
          className: "error",
        },
      );
      DEBUG && console.log(e);
    }
  }
  return newPlots;
};

export default useUpdatePlots;