import { useState, useEffect } from 'react';
import axios from 'axios';

const useShipmentDetails = (storedVoucherNo, storedYear) => {
  const [details, setDetails] = useState({});
  const [container20, setContainer20] = useState(false);
  const [container40, setContainer40] = useState(false);
  const [container45, setContainer45] = useState(false);
  const [isWebPerforationComplete, setIsWebPerforationComplete] = useState(false);
  const [custominvoice, setCustominvoice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchDetails = async () => {
    if (!storedVoucherNo || !storedYear) return;

    setIsLoading(true);
    try {
      const response = await axios.get(
        `https://esystems.cdl.lk/backend-test/ewharf/ValueList/GetSettlDetails?year=${storedYear}&vno=${storedVoucherNo}`,
        { timeout: 10000 }
      );
      
      if (response.data?.ResultSet?.[0]) {
        const data = response.data.ResultSet[0];
        let status = data.invoiceStatus;

        if (status === "") status = "Pending";
        else if (status === "V0") status = "Not Completed";
        else if (status === "V1") status = "Invoice Registered";
        else if (status === "V3") status = "Valuation Completed";

        setCustominvoice(data.customerInvNo);
        setContainer20(!!data.container_20);
        setContainer40(!!data.container_40);
        setContainer45(!!data.container_44 && !!data.container_45);
        setIsWebPerforationComplete(data.isWebPerforationComplete || false);
        setDetails({ ...data, invoiceStatus: status });
      }
    } catch (error) {
      console.error("Error fetching details:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [storedVoucherNo, storedYear]);

  return {
    details,
    container20,
    container40,
    container45,
    isWebPerforationComplete,
    custominvoice,
    isLoading,
    fetchDetails,
    setIsWebPerforationComplete
  };
};

export default useShipmentDetails;