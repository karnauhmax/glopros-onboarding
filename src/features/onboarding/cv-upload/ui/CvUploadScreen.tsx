'use client';

import { useRouter } from 'next/navigation';
import { useId } from 'react';
import styled from 'styled-components';

import {
  CV_PREFILL_NOTE,
  FileName,
  getNextStep,
  StepContent,
  StepHeading,
} from '@/features/onboarding/shared';
import { Button, CustomFormFileInput, Spinner } from '@/shared/ui';
import { textStyle } from '@/styles/text-style';

import { type CvUploadState, useCvUpload } from '../model';
import { CV_FILE_ACCEPT, CV_FILE_HINT } from '../validation';
import { CvUploadCard } from './CvUploadCard';

const DropZone = styled(CustomFormFileInput)`
  width: ${({ theme }) => theme.sizes.contentWidth};
  min-height: 264px;
`;

const Prompt = styled.p`
  ${textStyle('bodyMMedium')};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Hint = styled.p`
  ${textStyle('helper')};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Uploading = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[3]};
  color: ${({ theme }) => theme.colors.brand};
`;

const Helper = styled.p`
  ${textStyle('bodyM')};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.subtitle};
`;

interface DropZoneContentProps {
  state: CvUploadState;
  descriptionId: string;
  onRemove(): void;
}

function DropZoneContent({ state, descriptionId, onRemove }: DropZoneContentProps) {
  if (state.kind === 'empty') {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, next/image adds nothing */}
        <img src="/icons/upload-document.svg" alt="" width={47} height={60} />
        <Prompt>Drag &amp; drop CV or</Prompt>
        <Button size="md">Upload CV</Button>
        <Hint>{CV_FILE_HINT}</Hint>
      </>
    );
  }

  if (state.kind === 'uploading') {
    return (
      <Uploading role="status" aria-busy="true">
        <FileName>{state.fileName}</FileName>
        <Spinner size={20} />
      </Uploading>
    );
  }

  return (
    <CvUploadCard
      fileName={state.fileName}
      description={state.kind === 'success' ? CV_PREFILL_NOTE : state.message}
      tone={state.kind}
      descriptionId={descriptionId}
      onRemove={onRemove}
    />
  );
}

export function CvUploadScreen() {
  const router = useRouter();
  const { state, selectFile, remove } = useCvUpload();
  const descriptionId = useId();
  const nextPath = getNextStep('cv-upload')?.path;

  const handleContinue = () => {
    if (nextPath) {
      router.push(nextPath);
    }
  };

  return (
    <StepContent>
      <StepHeading
        title="Welcome to GloPros!"
        subtitle="Pick one source and we'll build your profile for you."
      />
      <DropZone
        label="Upload CV"
        accept={CV_FILE_ACCEPT}
        onSelectFile={selectFile}
        disabled={state.kind === 'uploading'}
        error={null}
        invalid={state.kind === 'error'}
        aria-describedby={state.kind === 'error' ? descriptionId : undefined}
      >
        <DropZoneContent state={state} descriptionId={descriptionId} onRemove={remove} />
      </DropZone>
      <Helper>You can replace your CV any time from your profile.</Helper>
      <Button onClick={handleContinue} disabled={state.kind !== 'success'}>
        Continue
      </Button>
    </StepContent>
  );
}
