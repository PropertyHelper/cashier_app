import React, { useState } from "react";
import {
    Box,
    Button,
    Input,
    Text,
    Field, VStack,
} from "@chakra-ui/react";
import {sendLogInRequest} from "../data/external/api.js";

// page to enter log in data
export default function LoginPage({ setToken }) {
    // states for the form and ui
    const [shopNickname, setShopNickname] = useState("");
    const [accountName, setAccountName] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // on login contact the server and set the token value
    const handleLogin = async () => {
        setError("");

        // send data according to backend contract
        const payload = {
            shop_nickname: shopNickname,
            account_name: accountName,
            password,
        };

        const { status, data } = await sendLogInRequest(payload);

        if (status === 200) {
            console.log("Login successful");
            console.log(data)
            setToken(data.token);
        } else {
            setError(data.detail || "Login failed");
        }
    };

    // form with 4 elements
    // shop nickname, account name, password and submit button in a vertical layout
    return (
        <Box maxW="sm" mx="auto" mt="20">
            <VStack spacing={4}>
                <Field.Root>
                    <Field.Label>Shop Nickname</Field.Label>
                    <Input
                        value={shopNickname}
                        onChange={(e) => setShopNickname(e.target.value)}
                    />
                </Field.Root>

                <Field.Root>
                    <Field.Label>Account Name</Field.Label>
                    <Input
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                    />
                </Field.Root>

                <Field.Root>
                    <Field.Label>Password</Field.Label>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Field.Root>

                <Button colorPalette="blue" onClick={handleLogin}>
                    Login
                </Button>

                {error && <Text color="red.500">{error}</Text>}
            </VStack>
        </Box>
    );
}
