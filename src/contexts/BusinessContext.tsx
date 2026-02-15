import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export type BusinessStatus = "ACTIVE" | "INACTIVE";

export interface Business {
  id: string;
  ruc: string;
  name: string;
  type: string;
  status: BusinessStatus;
  sunatSecondaryUser?: string;
  // Required to emit CPE directly to SUNAT (issuer address).
  addressLine1?: string;
  ubigeo?: string;
  department?: string;
  province?: string;
  district?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BusinessContextType {
  businesses: Business[];
  selectedBusiness: Business | null;
  selectedBusinessId: string | null;
  setSelectedBusinessId: (id: string | null) => void;
  loading: boolean;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

const getStorageKey = (uid: string) => `contapp:selectedBusiness:${uid}`;

export const BusinessProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setBusinesses([]);
      setSelectedBusinessId(null);
      setLoading(false);
      return;
    }

    const businessesRef = collection(db, "users", user.uid, "businesses");
    const businessesQuery = query(businessesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(
      businessesQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const item = doc.data();
          return {
            id: doc.id,
            ruc: item.ruc,
            name: item.name,
            type: item.type || "Sin tipo",
            status: (item.status || "ACTIVE") as BusinessStatus,
            sunatSecondaryUser: item.sunatSecondaryUser,
            addressLine1: item.addressLine1,
            ubigeo: item.ubigeo,
            department: item.department,
            province: item.province,
            district: item.district,
            createdAt: item.createdAt?.toDate?.(),
            updatedAt: item.updatedAt?.toDate?.(),
          } as Business;
        });

        setBusinesses(data);

        setSelectedBusinessId((prev) => {
          const hasSelected = prev && data.some((b) => b.id === prev);
          if (hasSelected) return prev;
          const stored =
            typeof window !== "undefined" ? window.localStorage.getItem(getStorageKey(user.uid)) : null;
          const storedExists = stored && data.some((b) => b.id === stored);
          if (storedExists) return stored;
          return data[0]?.id || null;
        });

        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid || !selectedBusinessId) return;
    if (typeof window === "undefined") return;
    window.localStorage.setItem(getStorageKey(user.uid), selectedBusinessId);
  }, [user?.uid, selectedBusinessId]);

  const selectedBusiness = useMemo(
    () => businesses.find((b) => b.id === selectedBusinessId) || null,
    [businesses, selectedBusinessId]
  );

  const value: BusinessContextType = {
    businesses,
    selectedBusiness,
    selectedBusinessId,
    setSelectedBusinessId,
    loading,
  };

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>;
};

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error("useBusiness debe usarse dentro de BusinessProvider");
  }
  return context;
};
