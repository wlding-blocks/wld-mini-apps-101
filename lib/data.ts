export interface Mission {
    id: string
    name: string
    description: string
    timeRequired: string
    reward: string
    rewardAmount: number
    rewardToken: string
    onchainVerification?: {
      type: string
      tokenAddress?: string
      requiredCount?: number
      requiredDays?: number
      action?: string
    }
  }
  
  export const missions: Mission[] = [
    // {
    //   id: "0",
    //   name: "Intro to World",
    //   description: "Learn the basics of the World platform and how to navigate through the interface.",
    //   timeRequired: "12 Minutes",
    //   reward: "50 Points",
    //   rewardAmount: 50,
    //   rewardToken: "Points"
    // },
    // {
    //   id: "1",
    //   name: "World App",
    //   description: "Explore the World App and discover its key features and functionalities.",
    //   timeRequired: "10 Minutes",
    //   reward: "75 Points",
    //   rewardAmount: 75,
    //   rewardToken: "Points"
    // },
    // {
    //   id: "2",
    //   name: "Building with World",
    //   description: "Create your first project using the World platform tools and resources.",
    //   timeRequired: "20 Minutes",
    //   reward: "100 Points",
    //   rewardAmount: 100,
    //   rewardToken: "Points"
    // },
    // {
    //   id: "3",
    //   name: "Advanced Features",
    //   description: "Dive deeper into World's advanced features and learn how to leverage them.",
    //   timeRequired: "25 Minutes",
    //   reward: "150 Points",
    //   rewardAmount: 150,
    //   rewardToken: "Points"
    // },
    // {
    //   id: "4",
    //   name: "World Mastery",
    //   description: "Master all aspects of the World platform and become a certified expert.",
    //   timeRequired: "45 Minutes",
    //   reward: "300 Points",
    //   rewardAmount: 300,
    //   rewardToken: "Points"
    // },
    {
      id: "5",
      name: "ORO Token Champion",
      description: "Claim ORO tokens 10 times over 10 days to demonstrate your commitment to the ecosystem.",
      timeRequired: "10 Days",
      reward: "5 WLD",
      rewardAmount: 5,
      rewardToken: "WLD",
      onchainVerification: {
        type: "token_claims",
        tokenAddress: "0xF3F92A60e6004f3982F0FdE0d43602fC0a30a0dB", // ORO token address
        requiredCount: 10,
        requiredDays: 10,
        action: "claim"
      }
    }
  ]
  
  