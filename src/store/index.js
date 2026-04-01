import { reactive } from "vue"

export const store = reactive({
  // Auth state
  isLoggedIn: false,
  user: null,

  // Mock user data
  mockUser: {
    id: "u1",
    name: "Sherzod Abdullayev",
    email: "sherzod@buyelp.uz",
    avatar: "https://ui-avatars.com/api/?name=Sherzod+Abdullayev&background=0D9488&color=fff&size=128",
    joined: "2024-09-01",
    reviews: [
      { placeId: "1", placeName: "Choyxona №1", rating: 5, text: "Best plov ever!", date: "2025-03-10" },
      { placeId: "5", placeName: "Chimgan Adventure Park", rating: 5, text: "Amazing experience!", date: "2025-02-28" },
    ],
  },

  login(email, password) {
    // Mock login - accept any credentials
    this.isLoggedIn = true
    this.user = { ...this.mockUser }
  },

  logout() {
    this.isLoggedIn = false
    this.user = null
  },

  register(name, email, password) {
    this.isLoggedIn = true
    this.user = {
      id: "u2",
      name,
      email,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff&size=128`,
      joined: new Date().toISOString().split("T")[0],
      reviews: [],
    }
  },
})
