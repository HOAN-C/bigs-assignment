/**
 * styled-components의 DefaultTheme을 앱 테마 타입으로 확장한다.
 * 이를 통해 styled-components 내에서 theme 속성에 자동완성이 적용된다.
 */
import 'styled-components';
import type { AppTheme } from './theme';

declare module 'styled-components' {
  export interface DefaultTheme extends AppTheme {}
}
