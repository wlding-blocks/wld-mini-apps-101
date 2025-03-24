export interface Mission {
    id: string
    name: string
    description: string
    timeRequired: string
    reward: string
  }
  
  export const missions: Mission[] = [
    {
      id: "0",
      name: "Intro to World",
      description: "Learn the basics of the World platform and how to navigate through the interface.",
      timeRequired: "12 Minutes",
      reward: "50 Points",
    },
    {
      id: "1",
      name: "World App",
      description: "Explore the World App and discover its key features and functionalities.",
      timeRequired: "10 Minutes",
      reward: "75 Points",
    },
    {
      id: "2",
      name: "Building with World",
      description: "Create your first project using the World platform tools and resources.",
      timeRequired: "20 Minutes",
      reward: "100 Points",
    },
    {
      id: "3",
      name: "Advanced Features",
      description: "Dive deeper into World's advanced features and learn how to leverage them.",
      timeRequired: "25 Minutes",
      reward: "150 Points",
    },
    {
      id: "4",
      name: "World Mastery",
      description: "Master all aspects of the World platform and become a certified expert.",
      timeRequired: "45 Minutes",
      reward: "300 Points",
    },
  ]
  
  