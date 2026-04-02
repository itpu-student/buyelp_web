

# BUYELP.UZ


BUYELP.UZ — LOCAL REVIEW WEB APP

Statement of work for the capstone project





PROJECT BACKGROUND

Project goals and objectives

Project goal is to create BuYelp.uz — a simple local review web application for users in Uzbekistan that allows people to easily find places and services, read reviews, and leave their own ratings, providing a clear and convenient way to discover restaurants, auto services, health services, activities, sports centers, and outdoor locations (Tabiat).

Project objectives:

− Develop a localized review platform that addresses the specific needs of Uzbekistan users by focusing on local categories and services that are not adequately covered by existing international platforms.
− Create a lightweight and user-friendly web application that prioritizes essential features needed for effective local business discovery and review sharing without overwhelming complexity.
− Implement a comprehensive place and service directory covering key categories important to local users including restaurants, auto services, health services, activities, sports centers, and outdoor locations (Tabiat).
− Design a simple and accessible interface that enables users to quickly search for places by name and category, view detailed business information, and contribute their own ratings and reviews.
− Establish a reliable review system that helps users make better decisions while providing small businesses with a platform to grow their visibility and reputation in the local market.
− Provide essential business communication features including direct calling functionality to facilitate immediate contact between users and service providers.
Intended users

An intended user of this application can be described like this:

− Users who want to easily find places and services in Uzbekistan and read or write reviews to help with decision-making about local businesses and services,
− relies on trustworthy information before visiting places and prefers structured, organized reviews over scattered social media recommendations,
− needs quick access to local business information including contact details, addresses, and user ratings for restaurants, auto services, health services, and recreational activities,
− values the ability to contribute to the local community by sharing their own experiences and helping others make informed choices about local services,
− prefers a simple, lightweight web application that focuses on essential functionality without unnecessary complexity or overwhelming features,
− frequently searches for specific local categories such as traditional establishments (Choyxona), outdoor recreational areas (Tabiat), and other culturally relevant services not well-covered by international platforms.


SCOPE OF WORK

Functional requirements

Core application logic and user management:

1. User registration and authentication: Simple user registration system with basic profile creation allowing users to create accounts and manage their review activity.
2. User profile management: Basic profile functionality for managing personal information and tracking review history.
Place and service management:

1. Business listing system: Comprehensive directory of local places and services organized by categories including restaurants, auto services, health services, activities, sports centers, and outdoor locations (Tabiat).
2. Place details display: Detailed business information pages showing name, address, phone number, short description, and overall rating with user reviews.
3. Category-based organization: Clear categorization system for easy navigation and discovery of different types of businesses and services.
Search and discovery functionality:

1. Search capabilities: Simple search functionality allowing users to find places by name and filter by category to quickly locate desired businesses or services.
2. Category browsing: Organized browsing experience by business categories for users who want to explore options within specific service types.
Review and rating system:

1. Rating submission: User-friendly rating system allowing customers to rate businesses and services based on their experiences.
2. Review management: Short review writing functionality enabling users to share detailed feedback about their experiences with local businesses.
3. Review display: Clear presentation of user ratings and reviews on business profile pages to help other users make informed decisions.
Communication features:

1. Direct contact functionality: Easy calling feature that allows users to directly contact businesses from their listing pages for immediate communication.
2. Business profile contact information: Clear display of business contact details including phone numbers and addresses.
User interface and experience:

1. Responsive web design: Clean, simple web interface optimized for both desktop and mobile browsing ensuring accessibility across different devices.
2. Lightweight design: Focused, streamlined interface that prioritizes essential features and maintains fast loading times.
Basic administrative features:

1. Content management: Basic administrative tools for managing business listings and user-generated content.
2. Review moderation: Simple moderation system to maintain content quality and prevent abuse.
Development tools and frameworks

Tasks
Tools
Backend development
Programming language
Go
Web framework
Gin
Alternative backend option
Node.js with Express.js
Database
Primary database
MongoDB
Alternative database
PostgreSQL
Frontend development
Frontend framework
Vue
Alternative frontend
React
Deployment and hosting
Primary hosting
Render
Alternative hosting options
Vercel, Heroku, AWS
Development tools
Version control
Git with GitHub
Development environment
Standard web development tools
Assumptions and constrains

Assumptions:

1. Target users: Have reliable internet access and are comfortable using web applications for finding local businesses and reading/writing reviews about services in Uzbekistan.
2. Business participation: Local businesses are willing to be listed on the platform and will provide accurate contact information and service details.
3. Development environment: Development team has access to required development tools, hosting services, and database systems specified in the technology stack.
Constrains:

1. Technology stack flexibility: Primary technology stack is Go with Gin framework and MongoDB database, with alternative options of Node.js/Express.js and PostgreSQL available based on development preferences and requirements.
2. Platform limitation: Web-based application only, focused on essential review and discovery features without advanced social networking or complex business management tools.
3. Scope limitation: Project focuses on core review platform functionality suitable for capstone project timeline, avoiding overly complex features that might compromise development quality.
4. Geographic focus: Platform specifically designed for Uzbekistan market with local categories and cultural considerations, limiting broader international applicability.
Deliverables

Critical deliverables:

1. Fully functional local review web application deployed and operational on chosen hosting platform, accessible via web browsers with complete place discovery and review functionality.
2. Complete source code with comprehensive documentation, well-structured codebase using chosen technology stack (Go/Gin or Node.js/Express), hosted on GitHub repository with clear development history.
3. Bachelor's thesis documenting the development process, local market analysis, technical decisions, and project outcomes.
Required deliverables:

1. Database schema and setup scripts for chosen database system (MongoDB or PostgreSQL) with sample data including local businesses across different categories.
2. Deployment guide with step-by-step instructions for hosting platform setup and application deployment procedures.
3. Basic administrative interface for managing business listings and user-generated content.
Aimed and optional deliverables:

1. User manual with comprehensive guide for both end users and business owners explaining platform functionality and usage procedures.
2. Performance optimization report analyzing application loading times, search functionality efficiency, and user experience metrics.
3. Local market analysis report documenting the specific needs of Uzbekistan users and how the platform addresses gaps in existing solutions.
Acceptance criteria

1. Functionality:
− All core review platform functionalities including user registration, business search, place details viewing, rating submission, and review writing are fully implemented and operational.
− Category-based business organization covers key local service types including restaurants, auto services, health services, activities, sports centers, and outdoor locations (Tabiat).
− Search functionality allows users to effectively find places by name and filter by category with accurate results.
− Business listings display complete information including name, address, phone number, description, and aggregated ratings from user reviews.
− Direct calling functionality enables users to easily contact businesses from their listing pages.
− Rating and review system allows users to submit ratings and write short reviews that are properly displayed on business pages.
2. Role- and task-specific criteria:
− Application uses chosen database system (MongoDB or PostgreSQL) with proper schema design for storing businesses, users, reviews, and ratings with appropriate data relationships.
− Web application built with selected technology stack (Go/Gin or Node.js/Express) provides reliable backend API and efficient data processing.
− Frontend framework (Vue or React) delivers responsive, user-friendly interface that works effectively across desktop and mobile browsers.
− Administrative tools enable proper management of business listings and review content with basic moderation capabilities.
3. Code quality:
− Source code follows best practices for chosen technology stack with consistent coding style and proper architectural organization.
− Code is well-structured, modular, and includes comprehensive comments explaining local business platform specific functionalities.
− Source code is managed using Git with clear commit history, appropriate versioning practices, and hosted on GitHub repository.
− Database design follows proper normalization or document structure principles with optimized performance for search and review operations.
4. Performance:
− Application loading time for business search and listing pages is under 3 seconds on standard internet connections.
− Search functionality performs efficiently with responsive results even with growing business directory.
− Review submission and display operations complete smoothly without delays or errors.
− System maintains good performance with concurrent users browsing and submitting reviews simultaneously.
5. Deployment:
− Web application is successfully deployed on chosen hosting platform (Render, Vercel, Heroku, or AWS) with stable operation and proper configuration.
− All application dependencies and environment configurations are properly documented and implemented.
− Business directory data is correctly configured and accessible through the web interface.
− Application maintains reliable uptime and availability for users during normal operation periods.
6. Testing:
− All critical platform functions are tested including user registration, business search, review submission, and business contact features.
− Search and filtering functionality is verified to work accurately across different business categories and search criteria.
− User interface is tested across different browsers and devices to ensure consistent functionality and responsive design.
− Data integrity is maintained throughout review and rating processes without data loss or corruption.
− Application handles error conditions gracefully including invalid search queries, missing business information, and user input errors with appropriate feedback.
− Platform functionality specifically addresses local market needs and provides meaningful improvement over existing solutions for Uzbekistan users.
2



==============================================================================


let me tell you about my personal dev condition

I want to use golang for backend (I want to do it on my own - case It is needs to some what fair)

for web, I dont care much what fw to use, just make sure it does not take a lot of resorse for developing it, case after you start it time comes I need to debug and imporve edit some code, at that time it shouldnt be slow or resource heavy (on client side It is ok, but dont make development - resource heavy)


with golang I will/want you mongodb



for now I want you to make web layout with dump data (later apis will be integrated)


feel free to  ask any questions



==============================================================================


**What language should the interface display?**: Bilingual (Uz/En)

**What visual style fits BuYelp.uz best?**: Clean & Modern (Recommended)

**Which pages should I build in this first phase?**: All Core Pages (Recommended)


==============================================================================

lets update design by our purpase:
- make people closer
- uzbek people can find places to hang out, spend time together with friends, family, colleagues like:
> going to choyxona, sauna, nature(tog'ga borish, picknik,...), playing football, tenis, pingpong, ...
> so app needs to be more human:
>  I want you to update ptotos: 
>  photo in login&register pages




==============================================================================


change UI of showing stars
4.5 star looks good in yelp.com but here it looks like 4 star `1/2` as you can see, it needs to be changed





==========================

square star ratings are good for flot-numeric values: 4.7, 4.5, 4.2, ..., which is used for general rating
but for user's personal rating, I liked the way in branch feat/star-rating-0

also I liked color of star from feat/star-rating-0

==========================



