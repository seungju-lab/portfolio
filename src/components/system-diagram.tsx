import type { ReactNode } from "react";

const diagrams: Record<
  string,
  { title: string; relations: readonly string[] }
> = {
  ilog: {
    title: "인증과 내부 서비스 요청 흐름",
    relations: [
      "브라우저에서 API Gateway로 서비스 요청을 보냅니다.",
      "API Gateway는 토큰 검증·공통 인증·라우팅을 담당합니다. Auth Service로 로그인·토큰 처리를 전달합니다.",
      "Auth Service와 Google은 OIDC 로그인으로 연결됩니다.",
      "API Gateway가 User Service와 Group Service에 검증된 사용자 식별자를 전달합니다.",
      "API Gateway·Auth Service·User Service·Group Service는 제가 담당했습니다. 세 경로의 Gateway는 같은 진입점입니다.",
    ],
  },
  lorekeeper: {
    title: "로그인·작품·회차의 구성",
    relations: [
      "Next.js 프론트엔드와 Spring Boot 백엔드는 로그인·작품·회차 API로 연결됩니다.",
      "Spring Boot 백엔드와 PostgreSQL은 사용자·작품·회차 데이터를 주고받습니다.",
      "Spring Boot 백엔드와 Redis는 OAuth 요청·토큰 데이터를 주고받습니다.",
      "프론트엔드는 로그인, 백엔드는 로그인·Work·Episode를 담당했습니다. 백엔드는 현재 계층형 MVP이며 도메인이 독립 서비스인 것은 아닙니다.",
    ],
  },
  "matching-ssafy": {
    title: "팀·채팅 API와 실시간 메시지",
    relations: [
      "React 화면과 Spring Boot 백엔드는 팀·채팅방·기록 조회 API로 연결됩니다.",
      "같은 화면과 백엔드 사이에서 WebSocket·STOMP로 실시간 메시지를 송수신합니다.",
      "백엔드의 팀·채팅과 프론트엔드 채팅 연동을 담당했습니다. 두 경로는 같은 애플리케이션 사이의 서로 다른 요청 흐름입니다.",
    ],
  },
};

function DiagramNode({
  name,
  responsibility,
}: {
  name: string;
  responsibility?: string;
}) {
  return (
    <div
      className={`diagram-node${responsibility ? " diagram-node-owned" : ""}`}
    >
      <span className="diagram-node-name">{name}</span>
      {responsibility && (
        <span className="diagram-node-role">{responsibility}</span>
      )}
    </div>
  );
}

function Connection({
  children,
  bidirectional = false,
  mobileOrigin,
  horizontal = false,
}: {
  children: ReactNode;
  bidirectional?: boolean;
  mobileOrigin?: string;
  horizontal?: boolean;
}) {
  return (
    <div
      className={`diagram-connection${horizontal ? " diagram-connection-horizontal" : ""}`}
    >
      <span>
        {mobileOrigin && (
          <span className="diagram-mobile-origin">{mobileOrigin}</span>
        )}
        {children}
      </span>
      <span className="diagram-arrow">
        {horizontal && <span className="diagram-arrow-horizontal">↔</span>}
        <span className={horizontal ? "diagram-arrow-vertical" : undefined}>
          {bidirectional ? "↕" : "↓"}
        </span>
      </span>
    </div>
  );
}

function IlogDiagram() {
  return (
    <>
      <DiagramNode name="브라우저" />
      <Connection>서비스 요청</Connection>
      <DiagramNode
        name="API Gateway"
        responsibility="담당 · 토큰 검증 · 공통 인증 · 라우팅"
      />
      <div className="diagram-branches diagram-branches-three">
        <div>
          <Connection mobileOrigin="Gateway → Auth Service">
            로그인·토큰 처리
          </Connection>
          <DiagramNode name="Auth Service" responsibility="담당" />
          <Connection bidirectional>OIDC 로그인</Connection>
          <DiagramNode name="Google" />
        </div>
        <div>
          <Connection mobileOrigin="Gateway → User Service">
            검증된 사용자 식별자
          </Connection>
          <DiagramNode name="User Service" responsibility="담당" />
        </div>
        <div>
          <Connection mobileOrigin="Gateway → Group Service">
            검증된 사용자 식별자
          </Connection>
          <DiagramNode name="Group Service" responsibility="담당" />
        </div>
      </div>
    </>
  );
}

function LorekeeperDiagram() {
  return (
    <>
      <DiagramNode name="Next.js 프론트엔드" responsibility="로그인 담당" />
      <Connection bidirectional>로그인·작품·회차 API</Connection>
      <DiagramNode
        name="Spring Boot 백엔드"
        responsibility="로그인·Work·Episode 담당"
      />
      <div className="diagram-branches">
        <div>
          <Connection bidirectional mobileOrigin="Backend ↔ PostgreSQL">
            사용자·작품·회차 데이터
          </Connection>
          <DiagramNode name="PostgreSQL" />
        </div>
        <div>
          <Connection bidirectional mobileOrigin="Backend ↔ Redis">
            OAuth 요청·토큰 데이터
          </Connection>
          <DiagramNode name="Redis" />
        </div>
      </div>
    </>
  );
}

function MatchingDiagram() {
  return (
    <>
      {[
        { title: "API 조회", label: "팀·채팅방·기록 조회 API" },
        { title: "실시간 메시지", label: "WebSocket · STOMP 메시지" },
      ].map((route) => (
        <div className="diagram-message-route" key={route.title}>
          <p className="diagram-route-title">{route.title}</p>
          <div className="diagram-message-flow">
            <DiagramNode name="React 화면" responsibility="채팅 연동 담당" />
            <Connection bidirectional horizontal>
              {route.label}
            </Connection>
            <DiagramNode
              name="Spring Boot 백엔드"
              responsibility="팀·채팅 담당"
            />
          </div>
        </div>
      ))}
    </>
  );
}

export function SystemDiagram({ slug }: { slug: string }) {
  const diagram = diagrams[slug];
  if (!diagram) return null;
  return (
    <figure
      className="system-diagram"
      aria-labelledby={`${slug}-diagram-title`}
    >
      <h3 id={`${slug}-diagram-title`}>{diagram.title}</h3>
      <p className="diagram-legend">담당 · 청록색 테두리와 역할 레이블</p>
      <div className="diagram-visual" aria-hidden="true">
        {slug === "ilog" ? (
          <IlogDiagram />
        ) : slug === "lorekeeper" ? (
          <LorekeeperDiagram />
        ) : (
          <MatchingDiagram />
        )}
      </div>
      <figcaption className="visually-hidden">
        <ul>
          {diagram.relations.map((relation) => (
            <li key={relation}>{relation}</li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
