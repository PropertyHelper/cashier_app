import {useEffect, useState} from "react";
import LoginPage from "./components/LoginPage.jsx";
import Catalogue from "./components/Catalogue.jsx";
import {CartProvider} from "./context/CartContext.jsx";
import UserProfileFinder from "./components/UserProfileFinder.jsx";
import {UserProvider} from "./context/UserContext.jsx";
import CheckoutPage from "./components/CheckoutPage.jsx";

// core component of the UI
const App = () => {
    // try to load token from localstorage, or return empty string
    const [token, setToken] = useState(() => {
        const savedToken = localStorage.getItem("jwt");
        return savedToken ? savedToken : "";
    });
    // used for simplified, step by step page display
    // flow:
    // Products -> Client identification -> Checkout
    const [step, setStep] = useState(0);
    // update token in localstorage whenever it changes
    useEffect(() => {
        localStorage.setItem("jwt", token);
    }, [token])
    // if token is not active, require cashier to log in.
    // otherwise, show the component depending on the flow's step
    // also wrap components into custom providers to allow easy access to cart and user data for checkout.
    if (!token) {
        return (
            <LoginPage setToken={setToken} />
            )
    } else  {
        return (
            <CartProvider>
                <UserProvider>
                { step === 0 ? (<Catalogue token={token} setStep={setStep} />) : // step 0
                    step === 1 ? (<UserProfileFinder token={token} setStep={setStep}/>) :  // step 1
                        (<CheckoutPage token={token} setStep={setStep} />) // step 2
                }
                </UserProvider>
            </CartProvider>
        )
    }
}

export default App;