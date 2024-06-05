import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";

const ErrorComp = () => {
  useEffect(() => {
    const handleMouseMove = (event) => {
      const pageX = document.documentElement.clientWidth;
      const pageY = document.documentElement.clientHeight;
      const mouseY = event.pageY;
      const mouseX = event.pageX / -pageX;
      const yAxis = ((pageY / 2 - mouseY) / pageY) * 300;
      const xAxis = -mouseX * 100 - 100;

      document.querySelector(
        ".box__ghost-eyes"
      ).style.transform = `translate(${xAxis}%, -${yAxis}%)`;
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <Box>
      <BoxGhost>
        <Symbol />
        <Symbol />
        <Symbol />
        <Symbol />
        <Symbol />
        <Symbol />
        <BoxGhostContainer>
          <BoxGhostEyes className="box__ghost-eyes">
            <BoxEyeLeft />
            <BoxEyeRight />
          </BoxGhostEyes>
          <BoxGhostBottom>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </BoxGhostBottom>
        </BoxGhostContainer>
        <BoxGhostShadow />
      </BoxGhost>
      <BoxDescription>
        <BoxDescriptionContainer>
          <BoxDescriptionTitle>Whoops!</BoxDescriptionTitle>
          <BoxDescriptionText>
            It seems like we couldn't find the page you were looking for
          </BoxDescriptionText>
        </BoxDescriptionContainer>
        <BoxButton>
          <Link to="/">Go back</Link>
        </BoxButton>
      </BoxDescription>
    </Box>
  );
};

const upndown = keyframes`
  0% { transform: translateY(5px); }
  50% { transform: translateY(15px); }
  100% { transform: translateY(5px); }
`;

const smallnbig = keyframes`
  0% { width: 90px; }
  50% { width: 100px; }
  100% { width: 90px; }
`;

const shine = keyframes`
  0% { opacity: 0.2; }
  25% { opacity: 0.1; }
  50% { opacity: 0.2; }
  100% { opacity: 0.2; }
`;

const Box = styled.div`
  width: 350px;
  height: 100%;
  max-height: 600px;
  min-height: 450px;
  background: #332f63;
  border-radius: 20px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 30px 50px;
`;

const BoxGhost = styled.div`
  padding: 15px 25px 25px;
  position: absolute;
  left: 50%;
  top: 30%;
  transform: translate(-50%, -30%);
`;

const Symbol = styled.div`
  &:nth-child(1) {
    opacity: 0.2;
    animation: ${shine} 4s ease-in-out 3s infinite;
    &:before,
    &:after {
      content: "";
      width: 12px;
      height: 4px;
      background: #fff;
      position: absolute;
      border-radius: 5px;
      bottom: 65px;
      left: 0;
    }
    &:before {
      transform: rotate(45deg);
    }
    &:after {
      transform: rotate(-45deg);
    }
  }
  &:nth-child(2) {
    position: absolute;
    left: -5px;
    top: 30px;
    height: 18px;
    width: 18px;
    border: 4px solid;
    border-radius: 50%;
    border-color: #fff;
    opacity: 0.2;
    animation: ${shine} 4s ease-in-out 1.3s infinite;
  }
  &:nth-child(3) {
    opacity: 0.2;
    animation: ${shine} 3s ease-in-out 0.5s infinite;
    &:before,
    &:after {
      content: "";
      width: 12px;
      height: 4px;
      background: #fff;
      position: absolute;
      border-radius: 5px;
      top: 5px;
      left: 40px;
    }
    &:before {
      transform: rotate(90deg);
    }
    &:after {
      transform: rotate(180deg);
    }
  }
  &:nth-child(4) {
    opacity: 0.2;
    animation: ${shine} 6s ease-in-out 1.6s infinite;
    &:before,
    &:after {
      content: "";
      width: 15px;
      height: 4px;
      background: #fff;
      position: absolute;
      border-radius: 5px;
      top: 10px;
      right: 30px;
    }
    &:before {
      transform: rotate(45deg);
    }
    &:after {
      transform: rotate(-45deg);
    }
  }
  &:nth-child(5) {
    position: absolute;
    right: 5px;
    top: 40px;
    height: 12px;
    width: 12px;
    border: 3px solid;
    border-radius: 50%;
    border-color: #fff;
    opacity: 0.2;
    animation: ${shine} 1.7s ease-in-out 7s infinite;
  }
  &:nth-child(6) {
    opacity: 0.2;
    animation: ${shine} 2s ease-in-out 6s infinite;
    &:before,
    &:after {
      content: "";
      width: 15px;
      height: 4px;
      background: #fff;
      position: absolute;
      border-radius: 5px;
      bottom: 65px;
      right: -5px;
    }
    &:before {
      transform: rotate(90deg);
    }
    &:after {
      transform: rotate(180deg);
    }
  }
`;

const BoxGhostContainer = styled.div`
  background: #fff;
  width: 100px;
  height: 100px;
  border-radius: 100px 100px 0 0;
  position: relative;
  margin: 0 auto;
  animation: ${upndown} 3s ease-in-out infinite;
`;

const BoxGhostEyes = styled.div`
  position: absolute;
  left: 50%;
  top: 45%;
  height: 12px;
  width: 70px;
`;

const BoxEyeLeft = styled.div`
  width: 12px;
  height: 12px;
  background: #332f63;
  border-radius: 50%;
  margin: 0 10px;
  position: absolute;
  left: 0;
`;

const BoxEyeRight = styled.div`
  width: 12px;
  height: 12px;
  background: #332f63;
  border-radius: 50%;
  margin: 0 10px;
  position: absolute;
  right: 0;
`;

const BoxGhostBottom = styled.div`
  display: flex;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  div {
    flex-grow: 1;
    position: relative;
    top: -10px;
    height: 20px;
    border-radius: 100%;
    background-color: #fff;
    &:nth-child(2n) {
      top: -12px;
      margin: 0 -0px;
      border-top: 15px solid #332f63;
      background: transparent;
    }
  }
`;

const BoxGhostShadow = styled.div`
  height: 20px;
  box-shadow: 0 50px 15px 5px #3b3769;
  border-radius: 50%;
  margin: 0 auto;
  animation: ${smallnbig} 3s ease-in-out infinite;
`;

const BoxDescription = styled.div`
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
`;

const BoxDescriptionContainer = styled.div`
  color: #fff;
  text-align: center;
  width: 200px;
  font-size: 16px;
  margin: 0 auto;
`;

const BoxDescriptionTitle = styled.div`
  font-size: 24px;
  letter-spacing: 0.5px;
`;

const BoxDescriptionText = styled.div`
  color: #8c8aa7;
  line-height: 20px;
  margin-top: 20px;
`;

const BoxButton = styled.a`
  display: block;
  position: relative;
  background: #ff5e65;
  border: 1px solid transparent;
  border-radius: 50px;
  height: 50px;
  text-align: center;
  text-decoration: none;
  color: #fff;
  line-height: 50px;
  font-size: 18px;
  padding: 0 70px;
  white-space: nowrap;
  margin-top: 25px;
  transition: background 0.5s ease;
  overflow: hidden;
  -webkit-mask-image: -webkit-radial-gradient(white, black);
  &:before {
    content: "";
    position: absolute;
    width: 20px;
    height: 100px;
    background: #fff;
    bottom: -25px;
    left: 0;
    border: 2px solid #fff;
    transform: translateX(-50px) rotate(45deg);
    transition: transform 0.5s ease;
  }
  &:hover {
    background: transparent;
    border-color: #fff;
    &:before {
      transform: translateX(250px) rotate(45deg);
    }
  }
`;

export default ErrorComp;
