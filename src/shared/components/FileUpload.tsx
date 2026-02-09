/**
 * 파일 업로드 컴포넌트.
 *
 * 두 가지 상태를 보여준다:
 * 1) 파일 미선택: 업로드 아이콘 + "Click to upload" 텍스트
 * 2) 파일 선택됨: 파일명 + "Click to replace" 링크
 *
 * cornerRadius 8, height 120(빈 상태), border 1px dashed.
 */
import { useRef } from 'react';
import styled from 'styled-components';

interface FileUploadProps {
  file: File | null;
  /** 기존 이미지 URL (수정 모드에서 사용) */
  existingImageUrl?: string | null;
  onChange: (file: File | null) => void;
}

const UploadArea = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  min-height: 120px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary};
  background: ${({ theme }) => theme.colors.bgMuted};
  padding: 32px;
  cursor: pointer;
  transition: border-color 0.15s ease;
  width: 100%;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accentPrimary};
  }
`;

const UploadIcon = styled.span`
  font-size: 24px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const UploadText = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textTertiary};
`;

const PreviewArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary};
  background: ${({ theme }) => theme.colors.bgMuted};
  width: 100%;
  cursor: pointer;
`;

const PreviewImage = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.bgInput};
  border: 1px solid ${({ theme }) => theme.colors.borderPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PreviewInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const FileName = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ReplaceText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.accentPrimary};
`;

const HiddenInput = styled.input`
  display: none;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

export default function FileUpload({ file, existingImageUrl, onChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    onChange(selected);
  };

  const hasPreview = file || existingImageUrl;
  const previewSrc = file ? URL.createObjectURL(file) : existingImageUrl;

  return (
    <Wrapper>
      <Label>Image (optional)</Label>
      <HiddenInput ref={inputRef} type="file" accept="image/*" onChange={handleChange} />
      {hasPreview ? (
        <PreviewArea onClick={handleClick}>
          <PreviewImage>
            {previewSrc && <img src={previewSrc} alt="preview" />}
          </PreviewImage>
          <PreviewInfo>
            <FileName>{file?.name ?? 'Current image'}</FileName>
            <ReplaceText>Click to replace image</ReplaceText>
          </PreviewInfo>
        </PreviewArea>
      ) : (
        <UploadArea onClick={handleClick}>
          <UploadIcon>⬆</UploadIcon>
          <UploadText>Click to upload or drag and drop</UploadText>
        </UploadArea>
      )}
    </Wrapper>
  );
}
