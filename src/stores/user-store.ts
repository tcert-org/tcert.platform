import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Database } from "../lib/database/database.types";

type User = Database["public"]["Tables"]["users"]["Row"];

interface UserState {
  user: string | null;
  updateUser: (encryptedUser: string) => void;
  getUser: () => Promise<User | null>;
}

export const useUserStore = create(
  persist<UserState>(
    (set, get) => ({
      user: null,
      updateUser: (encryptedUser) => {
        set({ user: encryptedUser });
      },
      getUser: async () => {
        const { user } = get();
        if (!user) return null;

        const response = await fetch("/api/decrypt-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ encryptedUser: user }),
        });

        if (!response.ok) {
          console.error("Failed to decrypt user");
          return null;
        }

        const data = await response.json();
        return data.user;
      },
    }),
    {
      name: "user-data",
      storage: {
        getItem: (name) => {
          const item = sessionStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);
