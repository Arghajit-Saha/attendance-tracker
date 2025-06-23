import { CircularProgress, Card, CardBody, Chip } from "@heroui/react";

type ProgressProps = {
  subject_code: string;
  subject_name: string;
  value: number;
};

export default function Progress({ subject_code, subject_name, value }: ProgressProps) {
  return (
    <Card className="w-full rounded-2xl border-none bg-black p-2">
      <CardBody className="flex flex-row items-center justify-center gap-2 sm:gap-4">
        {value > 85 ? (
          <CircularProgress
            classNames={{
              svg: "w-15 h-15 sm:w-25 sm:h-25 drop-shadow-md",
              indicator: "stroke-green-600/100",
              track: "stroke-green-200/100",
              value:
                "text-xs sm:text-xl font-regular sm:font-semibold text-white",
            }}
            showValueLabel={true}
            strokeWidth={3}
            value={value}
          />
        ) : (value >= 75 ? (
          <CircularProgress
            classNames={{
              svg: "w-15 h-15 sm:w-25 sm:h-25 drop-shadow-md",
              indicator: "stroke-yellow-600/100",
              track: "stroke-yellow-50/100",
              value:
                "text-xs sm:text-xl font-regular sm:font-semibold text-white",
            }}
            showValueLabel={true}
            strokeWidth={3}
            value={value}
          />
          ) : (
            <CircularProgress
              classNames={{
                svg: "w-15 h-15 sm:w-25 sm:h-25 drop-shadow-md",
                indicator: "stroke-red-500/100",
                track: "stroke-red-200/100",
                value:
                  "text-xs sm:text-xl font-regular sm:font-semibold text-white",
              }}
              showValueLabel={true}
              strokeWidth={3}
              value={value}
            />
          )
        )}
        <Chip
          classNames={{
            base: "",
            content: "text-white/90 font-semibold text-lg sm:text-xl",
          }}
          variant="bordered"
        >
          {subject_code}
          <p className="text-sm w-[250px] text-start truncate text-gray-400">
            {subject_name}
          </p>
        </Chip>
      </CardBody>
    </Card>
  );
}
