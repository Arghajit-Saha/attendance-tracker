import { CircularProgress, Card, CardBody, CardFooter, Chip } from "@heroui/react";

export default function Progress({subject_code, subject_name, value}) {
  return (
    <Card className="w-[400px] rounded-2xl border-none bg-black p-2">
      <CardBody className="flex flex-row items-center justify-center gap-2">
        <CircularProgress
          classNames={{
            svg: "w-20 h-20 drop-shadow-md",
            indicator: "stroke-white",
            track: "stroke-white/10",
            value: "text-l font-semibold text-white",
          }}
          showValueLabel={true}
          strokeWidth={4}
          value={value}
        />

        <Chip
          classNames={{
            base: "",
            content: "text-white/90 font-semibold text-xl",
          }}
          variant="bordered"
        >
          {subject_code}
          <p className="text-sm w-[250px] text-start truncate text-gray-400">{subject_name}</p>
        </Chip>
      </CardBody>
    </Card>
  );
}
