import {
    Box,
    Button,
    Heading,
    HStack,
    Image,
    Text,
    VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { getItemsDetails, createTransaction } from "../data/external/api";

export default function CheckoutPage({ token, setStep }) {
    // our context providers
    const { selectedItems, clearCart } = useCart();
    const { user, setUser } = useUser();
    // react states
    const [itemsDetails, setItemsDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // load data by selected uids from an API
    // the cart context does not store any data about items except item ids.
    // therefore, we dynamically load details to present to customer during checkout
    useEffect(() => {
        const fetchItems = async () => {
            if (!selectedItems || Object.keys(selectedItems).length === 0) {
                setError("No items selected.");
                setLoading(false);
                return;
            }
            try {
                const { status, data } = await getItemsDetails(token, Object.keys(selectedItems));
                if (status === 200) {
                    setItemsDetails(data.items);
                } else {
                    setError("Failed to fetch item details.");
                }
            } catch (e) {
                setError("Error fetching item details.");
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, [selectedItems]);

    // send a request to record a transaction at checkout
    const handleCheckout = async () => {
        setError("");
        setSuccess("");

        // backend expects array of pairs - [uid, number] + cashier token
        const item_id_quantity = Object.entries(selectedItems).map(
            ([iid, quantity]) => [iid, quantity]
        );

        const { status, data } = await createTransaction(token, {
            user_id: user.uid,
            item_id_quantity,
        });

        if (status === 200) {
            setSuccess("Transaction successful!");
        } else {
            setError(data.detail || "Transaction failed.");
        }
    };

    // clean the context and go to the start of the flow
    const handleNextCustomer = () => {
        clearCart();
        setUser(null);
        setStep(0);
    };

    // layout with customer data, cart data and buttons as menu
    return (
        <Box maxW="4xl" mx="auto" mt={10} p={4}>
            <Heading size="lg" mb={6}>
                Checkout
            </Heading>

            {/*user data*/}
            {user && (<>
                <Heading size="md" mb={6}>
                    User
                </Heading>
                <Box mb={6} p={4} borderWidth="1px" borderRadius="md">
                    <Text>
                        <strong>User ID:</strong> {user.uid}
                    </Text>
                    <Text>
                        <strong>Name:</strong> {user.first_name}
                    </Text>
                    <Text>
                        <strong>Username:</strong> {user.user_name}
                    </Text>
                </Box>
                </>)}

            {/*cart data*/}
            {loading ? <Text>Loading items...</Text> : <>
                <Heading size="md" mb={6}>
                    Cart
                </Heading>
                <VStack spacing={4} align="stretch">
                    {itemsDetails.map((item) => (
                        <Box
                            key={item.iid}
                            p={4}
                            borderWidth="1px"
                            borderRadius="md"
                            display="flex"
                            gap={4}
                        >{item.photo_url && (
                                <Image
                                    src={item.photo_url}
                                    alt={item.name}
                                    boxSize="100px"
                                />
                            )}
                            <Box>
                                <Text fontWeight="bold">{item.name}</Text>
                                <Text fontSize="sm" color="gray.600">
                                    {item.description}
                                </Text>
                                <Text mt={1}>
                                    Price: {item.price / 100} AED | Quantity: {selectedItems[item.iid]}
                                </Text>
                            </Box>
                        </Box>))}
                </VStack>
                </>}

            {/*status display*/}
            {error && (
                <Text mt={4} color="red.500">
                    {error}
                </Text>
            )}
            {success && (
                <Text mt={4} color="green.500">
                    {success}
                </Text>
            )}

            {/*button menu*/}
            <HStack mt={4} spacing={4}>
                <Button onClick={() => setStep(1)} variant="outline">
                    Back
                </Button>
                <Button
                    colorPalette="green"
                    onClick={handleCheckout}
                    disabled={loading || itemsDetails.length === 0}
                >
                    Checkout
                </Button>
                <Button
                    onClick={handleNextCustomer}
                >
                    Next Customer
                </Button>
            </HStack>

        </Box>
    );
}
