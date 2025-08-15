// src/components/common/PageHeader.jsx
import React from 'react';
import { Flex, Heading, IconButton, Tooltip, Box } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const canGoBack = () => {
  const state = window.history.state;
  if (state && typeof state.idx === 'number') return state.idx > 0;
  return window.history.length > 1;
};

export default function PageHeader({ title, fallbackHome = '/' }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (canGoBack()) navigate(-1);
    else navigate(fallbackHome, { replace: true });
  };

  const handleHome = () => navigate(fallbackHome);

  return (
    <Flex
      align="center"
      mb="4"
      p="3"
      borderBottom="1px solid"
      borderColor="gray.200"
      bg="white"
      position="sticky"
      top="0"
      zIndex="100"
      wrap="nowrap"
      minH="56px"
    >
      {/* Back Button */}
      <Tooltip label="Go Back" openDelay={300}>
        <IconButton
          aria-label="Go Back"
          icon={<span style={{ fontSize: '1.25rem' }}>🡰</span>}
          variant="ghost"
          onClick={handleBack}
          flexShrink={0}
          mr={2}
        />
      </Tooltip>

      {/* Title takes remaining space */}
      <Box flex="1" minW={0}>
        <Heading
          size="md"
          noOfLines={2}
          wordBreak="break-word"
          textAlign="center"
        >
          {title}
        </Heading>
      </Box>

      {/* Home Button always at far right */}
      <Tooltip label="Go Home" openDelay={300}>
        <IconButton
          aria-label="Go Home"
          icon={<span style={{ fontSize: '1.25rem' }}>🏠</span>}
          variant="ghost"
          onClick={handleHome}
          flexShrink={0}
          ml={2}
        />
      </Tooltip>
    </Flex>
  );
}
