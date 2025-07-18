import { useState } from "react";
import {
    Box,
    Button,
    Input,
    Text,
    Heading,
    SimpleGrid,
    QrCode,
    VStack
} from "@chakra-ui/react";
import {fetchUserProfile, renameUID, reportConfusedUser} from "../data/external/api";
import { WebcamFaceCapture } from "./WebcamFaceCapture.jsx";
import { useUser } from "../context/UserContext";

// user app link to generate QR code to
// Note: you need the address to be in the same network
// Therefore, localhost will not work on phone, but the link will work on pc.
const USER_APP_BASE_URL = "http://localhost:5174";

export default function UserProfileFinder({ token, setStep }) {
    // react states
    const [username, setUsername] = useState("");
    const [foundProfile, setFoundProfile] = useState(null);
    const [recognisedProfile, setRecognisedProfile] = useState(null);
    const [isFaceRecognitionOpen, setFaceRecognitionOpen] = useState(false);
    const [assumeNew, setAssumeNew] = useState(false);
    const [forceCorrection, setForceCorrection] = useState(false);
    const [error, setError] = useState("");
    const [mergeError, setMergeError] = useState("");
    const [mergeStatus, setMergeStatus] = useState("");
    // user context
    const { setUser } = useUser();

    // a function for manual user search
    const handleSearch = async () => {
        setError("");
        setFoundProfile(null);
        if (!username.trim()) {
            setError("Please enter a username.");
            return;
        }
        const {status, data} = await fetchUserProfile(token, username.trim());
        if (status === 200) {
            setFoundProfile(data);
        } else {
            setError(data.detail || "User not found.");
        }
    };

    // select the right user profile
    const handleContinue = () => {
        // in case of forceCorrection (wrong recognition),
        // we prefer found profile over recognisedProfile
        const activeUser = forceCorrection
            ? foundProfile
            : recognisedProfile || foundProfile;
        console.log("Proceeding with:", activeUser);
        setUser(activeUser)
        setStep(2);
    };

    // handle the face recognition api response
    // assume new if uid is present and user_name is not
    const handleFaceResponse = (response) => {
        if (response.uid && !response.user_name) {
            setAssumeNew(true);
        } else {
            setAssumeNew(false);
        }
        setRecognisedProfile(response);
    };

    // we have 2 types of merges
    // merge == existing user was recognised as new and we merge new user into existing
    // correct == existing user was recognised as another existing user and we correct the
    // profile data by using forceCorrection
    const onMerge = async (recognitionUid, foundUid, type) => {
        setMergeError("");
        setMergeStatus("");

        if (type === "merge") {
            const { status, data } = await renameUID(token, recognitionUid, foundUid);

            if (status !== 200) {
                setMergeError(data.detail || "Failed to merge profiles.");
            } else {
                setMergeStatus("Profile merged, you can press continue.");
                // unite the recognised profile with the found one
                setRecognisedProfile(foundProfile);
            }
        } else if (type === "correct") {
            // we report confusion, but backend does not send anything useful here
            // just enforce the correction then
            await reportConfusedUser(token, recognitionUid, foundUid)
            setMergeStatus("Correction request noted, you can press continue.");
        } else {
            setMergeError("Unknown merge type.");
        }
    };

    // reset profile finder data
    const resetAll = () => {
        setFoundProfile(null);
        setRecognisedProfile(null);
        setAssumeNew(false);
        setForceCorrection(false);
        setFaceRecognitionOpen(false);
        setUsername("");
        setError("");
        setMergeError("");
        setMergeStatus("");
    };

    return (
        <Box maxW="6xl" mx="auto" mt={10} p={4}>
            <Heading mb={6} size="lg" textAlign="center">
                Identify User
            </Heading>

            <SimpleGrid columns={[1, null, 2]} spacing={10}>
                {/*section for face recognition*/}
                <Box>
                    <Heading size="md" mb={4}>Face Recognition</Heading>

                    {!recognisedProfile && (
                        <Button onClick={() => setFaceRecognitionOpen(prev => !prev)} mb={4}>
                            {isFaceRecognitionOpen ? "Cancel Face Recognition" : "Use Face Recognition"}
                        </Button>
                    )}

                    {isFaceRecognitionOpen && !recognisedProfile && (
                        <WebcamFaceCapture setFaceResponse={handleFaceResponse} token={token}/>
                    )}

                    {recognisedProfile && (
                        <Box p={3} borderWidth="1px" borderRadius="md" mt={4}>
                            <Text><strong>UID:</strong> {recognisedProfile.uid}</Text>
                            <Text><strong>First Name:</strong> {recognisedProfile.first_name || "-"}</Text>
                            <Text><strong>Username:</strong> {recognisedProfile.user_name || "-"}</Text>
                        </Box>
                    )}

                    {recognisedProfile && assumeNew && (
                        <>
                        <Text mt={3} color="orange.500" fontWeight="semibold">
                            New user detected. You can search and merge manually.
                        </Text>
                        <QrCode.Root value={USER_APP_BASE_URL + "/register/?uid=" + recognisedProfile.uid}>
                            <QrCode.Frame>
                                <QrCode.Pattern/>
                            </QrCode.Frame>
                        </QrCode.Root>
                        </>
                    )}

                    {recognisedProfile && !assumeNew && (
                        <Button
                            onClick={() => setForceCorrection(true)}
                            mt={3}
                            colorPalette="red"
                            variant="outline"
                        >
                            Recognition incorrect — search manually
                        </Button>
                    )}
                </Box>

                {/*manual search*/}
                <Box>
                    <Heading size="md" mb={4}>Manual Search</Heading>

                    <VStack spacing={3}>
                        <Input
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <Button onClick={handleSearch}>
                            {/*if recognised profile and assummed new show "find user to merge"*/}
                            {/*if recognised profile and forceCorrection new show "Choose another user"*/}
                            {/*if recognised profile (and not any of assumed new or forceCorrection),
                            show "find user"*/}
                            {(recognisedProfile && (assumeNew || forceCorrection))
                                ? (assumeNew ? "Find User to Merge" : "Choose another user")
                                : "Find User"}
                        </Button>

                        {error && <Text color="red.500">{error}</Text>}

                        {foundProfile && (
                            <Box p={3} borderWidth="1px" borderRadius="md">
                                <Text><strong>UID:</strong> {foundProfile.uid}</Text>
                                <Text><strong>First Name:</strong> {foundProfile.first_name}</Text>
                                <Text><strong>Username:</strong> {foundProfile.user_name}</Text>
                            </Box>
                        )}

                        {/*for assumeNew select merge, for forceCorrection - correct*/}
                        {foundProfile && recognisedProfile && (assumeNew || forceCorrection) && (
                            <Button
                                onClick={() =>
                                    onMerge(recognisedProfile.uid, foundProfile.uid,
                                        assumeNew ? "merge" : "correct"
                                    )
                                }
                            >
                                {assumeNew ? "Merge New User" : "Correct Recognition"}
                            </Button>
                        )}

                        {mergeStatus && <Text color="green.500">{mergeStatus}</Text>}
                        {mergeError && <Text color="red.500">{mergeError}</Text>}
                    </VStack>
                </Box>
            </SimpleGrid>

            {/*button menu*/}
            <Box mt={8} textAlign="center">
                <Button size="lg" onClick={() => setStep(0)} mr={4}>
                    Back
                </Button>
                {(foundProfile || recognisedProfile) && (
                    <Button colorPalette="green" size="lg" onClick={handleContinue} mr={4}>
                        Continue
                    </Button>
                )}
                <Button variant="ghost" size="lg" colorPalette="gray" onClick={resetAll}>
                    Reset
                </Button>
            </Box>
        </Box>
    );
}
