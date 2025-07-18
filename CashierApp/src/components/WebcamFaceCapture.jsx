import React, { useRef, useEffect, useState } from "react";
import * as faceApi from "face-api.js";
import { Button, VStack, Text } from "@chakra-ui/react";
import { uploadFaceImage } from "../data/external/api.js";

// a component to capture the face via the camera and send it to the server via API call
export const WebcamFaceCapture = ({ token, setFaceResponse }) => {
    // react states
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadModels = async () => {
            // use pretrained models
            const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";
            await Promise.all([
                faceApi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceApi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
            ]);
            setModelsLoaded(true);
        };
        loadModels();
    }, []);

    const startCamera = async () => {
        setError("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) videoRef.current.srcObject = stream;
            await detectLoop();
        } catch (err) {
            setError("Camera access denied or not available.");
        }
    };

    const stopCamera = () => {
        const stream = videoRef.current?.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const detectLoop = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;

        const ctx = canvas.getContext("2d"); // get the drawing interface
        if (!ctx) return;

        const displaySize = { width: video.width, height: video.height };
        faceApi.matchDimensions(canvas, displaySize);

        // check the camera for the face
        const interval = setInterval(async () => {
            if (!modelsLoaded || capturing) return;

            const result = await faceApi
                .detectSingleFace(video, new faceApi.TinyFaceDetectorOptions())
                .withFaceExpressions();

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // if found a face
            if (result) {
                const resized = faceApi.resizeResults(result, displaySize);
                faceApi.draw.drawDetections(canvas, resized);

                const expression = result.expressions.happy;  // get the hapiness probability
                if (expression > 0.9) { // a person is happy <==> a person smiles
                    setCapturing(true);
                    clearInterval(interval);
                    const success = await captureImage();
                    if (success) stopCamera();
                    else setCapturing(false);
                }
            }
        }, 200);
    };
    // get the image and send it to the server
    const captureImage = async () => {
        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        if (!video) return false;

        const detection = await faceApi
            .detectSingleFace(video, new faceApi.TinyFaceDetectorOptions());

        if (detection) {
            const { x, y, width, height } = detection.box;
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");

            ctx.drawImage(video, x, y, width, height, 0, 0, width, height);
            // transform an image into a binary object to send it later to server
            const blob = await new Promise(resolve =>
                canvas.toBlob(resolve, "image/jpeg")
            );

            if (blob) {
                // send data to server
                const { status, data } = await uploadFaceImage(blob, token);
                setCapturing(false);
                // set the response
                if (status === 200) {
                    if (data.assummed_new) {
                        setFaceResponse(data);
                    } else {
                        setFaceResponse(data.user);
                    }
                } else {
                    setError(data.detail || "Face recognition failed.");
                }
                return true;
            }
        }

        setError("No face detected.");
        setCapturing(false);
        return false;
    };

    return (
        <VStack>
            <video ref={videoRef} width="640" height="480" autoPlay muted style={{ position: "absolute" }} />
            <canvas ref={canvasRef} width="640" height="480" style={{ position: "absolute" }} />
            {/*Requires permissions*/}
            <Button mt={500} onClick={startCamera} isLoading={!modelsLoaded || capturing}>
                Start Camera
            </Button>
            {error && <Text color="red.500">{error}</Text>}
        </VStack>
    );
};