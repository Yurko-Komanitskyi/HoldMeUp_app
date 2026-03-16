export interface CreateGymMemberInput {
  gymId: string;
  userId: string;
  role: string;
}

export interface UpdateGymMemberInput {
  gymId: string;
  id: string; // memberId
  role?: string;
}

