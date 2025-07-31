import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UserRowType } from "@/modules/auth/table";

type User = UserRowType & { roles?: { name: string } | null };

interface UserState {
  user: string | null;
  decryptedUser: User | null;
  updateUser: (encryptedUser: string) => void;
  getUser: () => Promise<User | null>;
  refreshUser: () => Promise<User | null>; // 🔹 Nueva función
}

export const useUserStore = create(
  persist<UserState>(
    (set, get) => ({
      user: null,
      decryptedUser: null,
      updateUser: (encryptedUser) => {
        set({ user: encryptedUser, decryptedUser: null });
      },
      getUser: async () => {
        const { user, decryptedUser } = get();
        if (!user) return null;

        if (decryptedUser) return decryptedUser;

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
        const userData = data.user as User;
        set({ decryptedUser: userData });
        return userData;
      },
      refreshUser: async () => {
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
          console.error("Failed to refresh user");
          return null;
        }

        const data = await response.json();
        const userData = data.user as User;
        set({ decryptedUser: userData });
        return userData;
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
