# $COCK Holders Dashboard

This is a dashboard template that displays information about the holders of a cryptocurrency token. By default, it shows the holders of the $COCK cryptocurrency token, but you can customize it to display the holders of any other token by changing the API URL and token parameters.

## Features
- Displays a list of holders with their balance and percentage.
- Automatically updates every 5 minutes.
- Responsive layout for mobile and desktop.
- A loading animation while data is being fetched.

## Technologies Used
- **React**: A JavaScript library for building user interfaces.
- **Tailwind CSS**: A utility-first CSS framework for styling.
- **Vercel**: A platform for deploying front-end applications.

## Setup

### Prerequisites
- Node.js (version 14 or above)

### Installation
1. Clone this repository to your local machine.

   ```bash
   git clone https://github.com/komiwalnut/token-dashboard.git
   ```

2. Navigate to the project directory:
   ```bash
   cd token-dashboard
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the development server
   ```bash
   npm start
   ```
   This will run the dashboard locally, and you can view it in your browser at http://localhost:3000.

5. Deploy to Vercel or any other hosting provider by following their respective deployment instructions.

### Deployment
1. Install Vercel CLI (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. Log in to your Vercel account:
   ```bash
   vercel login
   ```

3. Deploy your project:
   ```bash
   vercel
   ```

4. Follow the prompts to complete the deployment.
5. Your project will be live at the URL provided by Vercel.

### Customization
To display the holders of a different token, modify the following in the code:

- Replace the <b>API_URL</b> in the ```components/Dashboard.jsx``` file with the endpoint that provides the holders data for your chosen token.
- Adjust any other parameters (e.g., token contract address) as necessary in the same file.
- Replace the image of the coin in ```public/image.png``` with the image representing your token.