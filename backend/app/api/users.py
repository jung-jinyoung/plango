from fastapi import APIRouter, HTTPException

# 회원가입/로그인은 Supabase Auth에 위임한다 (프론트엔드가 supabase-js로 직접 처리).
# 이 라우터는 인증된 사용자의 프로필/설정만 다룬다 (G1 프로필/설정 화면 대응).
# TODO(후속 브랜치): Supabase JWT 검증 의존성을 추가해 /users/me를 실제 사용자와 연결한다.
router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", status_code=501)
async def get_my_profile() -> None:
    raise HTTPException(status_code=501, detail="not implemented")


@router.patch("/me", status_code=501)
async def update_my_profile() -> None:
    raise HTTPException(status_code=501, detail="not implemented")
