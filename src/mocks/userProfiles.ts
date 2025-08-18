import { Child } from "../types/Child";

export type UserProfile = "padrinho" | "guardiao" | "unico";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  cpf: string;
  profile: UserProfile;
  donorType: "sponsor" | "monthly" | "single";
  monthlyDonation?: {
    amount: number;
    nextPayment: string;
    status: "active" | "pending" | "cancelled";
    paymentMethod: "credit_card" | "pix" | "bank_transfer";
  };
  sponsoredChild?: Child;
  sponsorships?: Array<{
    childId: string;
    childName: string;
    startDate: string;
    monthlyAmount: number;
    status: "active" | "paused" | "cancelled";
  }>;
  donations: {
    id: string;
    date: string;
    amount: number;
    type: "monthly" | "single" | "sponsorship";
    status: "completed" | "pending" | "cancelled";
    description: string;
  }[];
  letters?: {
    id: string;
    date: string;
    type: "sent" | "received";
    content: string;
    status: "delivered" | "pending" | "received";
  }[];
  visits?: {
    id: string;
    date: string;
    status: "scheduled" | "completed" | "cancelled";
    location: string;
  }[];
}

export const mockUsers: Record<UserProfile, MockUser> = {
  padrinho: {
    id: "1",
    name: "Filipe Silva",
    email: "filipe@email.com",
    cpf: "12345678909",
    profile: "padrinho",
    donorType: "sponsor",
    monthlyDonation: {
      amount: 50,
      nextPayment: "2024-04-15",
      status: "active",
      paymentMethod: "credit_card"
    },
    sponsoredChild: {
      id: "gael",
      name: "Gael",
      age: 8,
      location: "Bahia",
      image: "/criancas/Gael.png",
      story: "Gael adora brincar ao ar livre e sonha em ser jogador de futebol. Ele vive com os pais e dois irmãos em uma pequena cidade do interior.",
      needs: ["Apoio educacional", "Apoio nutricional", "Desenvolvimento social"],
      gender: "M"
    },
    donations: [
      {
        id: "1",
        date: "2024-03-15",
        amount: 50,
        type: "sponsorship",
        status: "completed",
        description: "Apadrinhamento - Ana"
      },
      {
        id: "2",
        date: "2024-02-15",
        amount: 50,
        type: "sponsorship",
        status: "completed",
        description: "Apadrinhamento - Ana"
      }
    ],
    letters: [
      {
        id: "1",
        date: "2024-03-01",
        type: "sent",
        content: "Olá Ana! Como você está? Espero que esteja bem...",
        status: "delivered"
      },
      {
        id: "2",
        date: "2024-03-15",
        type: "received",
        content: "Oi padrinho! Estou bem e gosto muito da escola...",
        status: "received"
      }
    ],
    visits: [
      {
        id: "1",
        date: "2024-04-20",
        status: "scheduled",
        location: "Bahia"
      }
    ]
  },
  guardiao: {
    id: "2",
    name: "Maria Santos",
    email: "maria@email.com",
    cpf: "98765432109",
    profile: "guardiao",
    donorType: "monthly",
    monthlyDonation: {
      amount: 30,
      nextPayment: "2024-04-10",
      status: "active",
      paymentMethod: "pix"
    },
    donations: [
      {
        id: "1",
        date: "2024-03-10",
        amount: 30,
        type: "monthly",
        status: "completed",
        description: "Doação Mensal"
      },
      {
        id: "2",
        date: "2024-02-10",
        amount: 30,
        type: "monthly",
        status: "completed",
        description: "Doação Mensal"
      }
    ]
  },
  unico: {
    id: "3",
    name: "João Pereira",
    email: "joao@email.com",
    cpf: "45678912309",
    profile: "unico",
    donorType: "single",
    donations: [
      {
        id: "1",
        date: "2024-03-05",
        amount: 100,
        type: "single",
        status: "completed",
        description: "Doação Única"
      }
    ]
  }
}; 