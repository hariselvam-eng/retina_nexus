import asyncio

from sqlalchemy import select

from app.database.session import SessionLocal
from app.models.user import User
from app.core.security import hash_password, UserRole


async def main():
    async with SessionLocal() as db:
        result = await db.execute(
            select(User).where(
                User.email == "anika.menon@clinic.org"
            )
        )

        user = result.scalar_one_or_none()

        if user:
            print(f"User already exists: {user.email}")
            return

        user = User(
            email="anika.menon@clinic.org",
            full_name="Dr. Anika Menon",
            password_hash=hash_password("Retina@123"),
            role=UserRole.CLINICIAN,
            is_active=True,
        )

        db.add(user)
        await db.commit()

        print("Demo user created successfully")
        print("Email: anika.menon@clinic.org")
        print("Password: Retina@123")


if __name__ == "__main__":
    asyncio.run(main())