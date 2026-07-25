"use client";

import { useState } from "react";

type Rule = (v: string) => string | null;

const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const schema: Record<string, Rule[]> = {
  email: [
    (v) => (!v ? "이메일은 필수입니다" : null),
    (v) => (v && !emailRe.test(v) ? "이메일 형식이 아닙니다" : null),
  ],
  password: [
    (v) => (!v ? "비밀번호는 필수입니다" : null),
    (v) => (v && v.length < 8 ? "8자 이상이어야 합니다" : null),
  ],
};

function validate(field: string, value: string): string | null {
  for (const rule of schema[field]) {
    const err = rule(value);
    if (err) return err;
  }
  return null;
}

export function FormValidationDemo() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = {
    email: validate("email", values.email),
    password: validate("password", values.password),
  };
  const isValid = !errors.email && !errors.password;

  const field = (name: "email" | "password", label: string, type = "text") => {
    const err = errors[name];
    const show = touched[name] && err;
    return (
      <label className="flex flex-col gap-1">
        <span className="text-xs text-foreground/70">{label}</span>
        <input
          type={type}
          value={values[name]}
          onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))}
          onBlur={() => setTouched((t) => ({ ...t, [name]: true }))}
          className={`rounded-md border px-2 py-1.5 text-sm outline-none ${
            show
              ? "border-red-400 focus:ring-2 focus:ring-red-400/40"
              : "border-black/15 focus:ring-2 focus:ring-indigo-400/40 dark:border-white/20"
          }`}
        />
        <span className="min-h-4 text-xs text-red-500">{show ? err : ""}</span>
      </label>
    );
  };

  return (
    <div className="flex max-w-xs flex-col gap-2 text-sm">
      {field("email", "이메일", "email")}
      {field("password", "비밀번호", "password")}
      <button
        disabled={!isValid}
        onClick={() => setTouched({ email: true, password: true })}
        className="mt-1 rounded-md bg-indigo-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-indigo-600 disabled:opacity-40"
      >
        {isValid ? "제출 가능 ✓" : "제출"}
      </button>
      <p className="text-xs text-foreground/50">
        입력하고 포커스를 벗어나면(blur) 실시간 검증됩니다. 규칙은 필드별
        함수 배열로 선언돼 있어요.
      </p>
    </div>
  );
}
