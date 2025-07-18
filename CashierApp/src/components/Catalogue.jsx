import { useEffect, useState } from "react";
import {
    Box,
    SimpleGrid,
    Spinner,
    Text,
    Heading,
    Button,
} from "@chakra-ui/react";
import { fetchShopItems } from "../data/external/api";
import ProductCard from "./ProductCard.jsx";
import { useCart } from "../context/CartContext";

export default function Catalogue({ token, setStep }) {
    // react stats
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    // state for the number of items selected
    const { selectedItems } = useCart();

    // load data by using token to issue request to API
    useEffect(() => {
        async function loadItems() {
            const { status, data } = await fetchShopItems(token);
            if (status === 200) {
                setItems(data.items);
            } else {
                setError(data.detail || "Error loading items");
            }
            setLoading(false);
        }
        loadItems();
    }, [token]);

    // render loading spinner in case the data does not arrive from API
    if (loading) {
        return (
            <Box textAlign="center" mt={10}>
                <Spinner size="xl" />
            </Box>
        );
    }
    // render an error if something went wrong while loading
    if (error) {
        return (
            <Box textAlign="center" mt={10}>
                <Text color="red.500">{error}</Text>
            </Box>
        );
    }

    // count total number of selected items
    const selectedCount = Object.keys(selectedItems).length;

    // layout of heading, a 3-column grid of products and the continue button, active when positive
    // number of products was selected
    return (
        <Box p={4}>
            <Heading size="lg" mb={6} textAlign="center">
                Product Catalog
            </Heading>

            {items.length === 0 ? (
                <Box textAlign="center" mt={8}>
                    <Text fontSize="lg" color="gray.500">
                        Add products via managerial console.
                    </Text>
                </Box>
            ) : (
                <>
                    <SimpleGrid columns={[1, 2, 3]} spacing={6} mb={6}>
                        {items.map((item) => (
                            <ProductCard key={item.iid} item={item} />
                        ))}
                    </SimpleGrid>

                    <Box textAlign="center">
                        <Button
                            size="lg"
                            disabled={Object.keys(selectedItems).length === 0}
                            onClick={() => {
                                console.log("Next step", selectedItems);
                                setStep(1);
                            }}
                        >
                            Next Step ({selectedCount})
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
}
