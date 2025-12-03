# Development 
After cloning the repository, follow these steps to set up your local development environment and run the application.

## Prerequisites
- Node.js (v18 or later)
- Docker (For Local Supabase)

## Setup
1. Clone the repository
    ```bash
    git clone git@github.com:Mafflle/cb-web.git
    ```

2. Navigate to the project directory
    ```bash
    cd cb-web
    ```

3. Install dependencies
    ```bash
    pnpm install
    ```

4. Create a `.env` file in the root directory and copy the contents from `.env.example`:
    ```bash
    cp .env.example .env
    ```

5. Set the necessary environment variables in the `.env` file:
    ```bash
    VITE_SUPABASE_URL=<your_supabase_url>
    VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>

    # For payment processing (if applicable)
    VITE_MONNIFY_API_KEY=<your_monnify_api_key>
    VITE_MONNIFY_CONTRACT_CODE=<your_monnify_contract_code>
    ```


# Setup Local Supabase
1. Login to Supabase CLI
    ```bash
    pnpx supabase login
    ```

2. Set necessary environment variables for sms auth in the `.env` file:
    ```bash
    SUPABASE_AUTH_SMS_TWILIO_VERIFY_ACCOUNT_SID=<your_twillio_account_sid>
    SUPABASE_AUTH_SMS_TWILIO_VERIFY_SERVICE_SID=<your_twillio_service_sid>
    SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN=<your_twillio_auth_token>
    ```

3. Start Supabase
    ```bash
    pnpx supabase start
    ```

4. Run migrations
    ```bash
    pnpx supabase db push --local
    ```
