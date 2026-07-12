"use client";

import {
	Check,
	Copy,
	ExternalLink,
	Heart,
	ShieldCheck,
	Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CryptoNetwork = {
	id: string;
	name: string;
	asset: string;
	address: string;
	note: string;
};

const cryptoNetworks: CryptoNetwork[] = [
	{
		id: "btc",
		name: "BTC",
		asset: "Bitcoin",
		address: "bc1pga03zhpk860pcva56rjtm2hjflk3nhu8jp6pap0m9vxyy352h7kqwx4mfr",
		note: "Send only Bitcoin on the BTC network.",
	},
	{
		id: "evm",
		name: "EVM",
		asset: "ETH / USDT / USDC",
		address: "0xBf8EFD31B14a5B05dBB9057096bbE11eaC4C92Ab",
		note: "Compatible with EVM networks such as Ethereum, BNB Smart Chain, Polygon, Arbitrum, Optimism, and Base.",
	},
	{
		id: "solana",
		name: "Solana",
		asset: "SOL / USDC",
		address: "4dbnyL7uDXXMNJBV1EgLDDrbbTZA6TtLuca8knMqd6U3",
		note: "Send only Solana network assets to this address.",
	},
];

const paypalUrl = "https://paypal.me/rivainst";

function getQrCodeUrl(value: string) {
	return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=16&data=${encodeURIComponent(value)}`;
}

export function DonatePage() {
	const [selectedNetworkId, setSelectedNetworkId] = useState(
		cryptoNetworks[0].id,
	);
	const [copiedAddress, setCopiedAddress] = useState(false);
	const selectedNetwork = useMemo(
		() =>
			cryptoNetworks.find((network) => network.id === selectedNetworkId) ??
			cryptoNetworks[0],
		[selectedNetworkId],
	);

	const copyAddress = async () => {
		await navigator.clipboard.writeText(selectedNetwork.address);
		setCopiedAddress(true);
		window.setTimeout(() => setCopiedAddress(false), 1800);
	};

	return (
		<div className="relative overflow-hidden bg-background text-foreground">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(37,99,235,0.16),transparent_30%),radial-gradient(circle_at_90%_80%,rgba(14,165,233,0.13),transparent_28%)]" />

			<section className="relative px-4 py-12 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-6xl">
					<div className="mx-auto max-w-3xl text-center">
						<p className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/10 bg-card/80 px-4 py-2 text-sm font-semibold text-primary shadow-sm">
							<Heart className="size-4" /> Support PixConvertly
						</p>
						<h1 className="mt-5 font-heading text-4xl font-extrabold tracking-[-0.04em] text-foreground sm:text-6xl">
							Help keep PixConvertly free
						</h1>
						<p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
							Your donation helps maintain a fast, private, browser-based image
							converter with no account, no watermark, and no file uploads to a
							server.
						</p>
					</div>

					<div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
						<section className="rounded-3xl border border-border bg-card/80 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur sm:p-6">
							<div className="flex items-start gap-3">
								<div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
									<Wallet className="size-5" />
								</div>
								<div>
									<h2 className="text-2xl font-extrabold text-foreground">
										Donate with crypto
									</h2>
									<p className="mt-1 text-sm leading-6 text-muted-foreground">
										Choose a network, scan the QR code, or copy the wallet
										address below.
									</p>
								</div>
							</div>

							<div className="mt-6 grid gap-3 sm:grid-cols-3">
								{cryptoNetworks.map((network) => (
									<button
										key={network.id}
										type="button"
										onClick={() => {
											setSelectedNetworkId(network.id);
											setCopiedAddress(false);
										}}
										className={cn(
											"rounded-2xl border p-4 text-left transition focus:outline-none focus:ring-4 focus:ring-primary/20",
											selectedNetwork.id === network.id
												? "border-primary bg-primary/10 text-foreground shadow-sm"
												: "border-border bg-card text-muted-foreground hover:border-primary/30 hover:bg-muted",
										)}
									>
										<span className="block text-lg font-extrabold">
											{network.name}
										</span>
										<span className="mt-1 block text-xs text-muted-foreground">
											{network.asset}
										</span>
									</button>
								))}
							</div>

							<div className="mt-6 grid gap-6 rounded-2xl border border-border bg-secondary/60 p-5 md:grid-cols-[280px_1fr] md:items-center">
								<div className="mx-auto rounded-3xl border border-border bg-card p-4 shadow-sm">
									<img
										src={getQrCodeUrl(selectedNetwork.address)}
										alt={`${selectedNetwork.name} donation QR code`}
										className="size-[260px] max-w-full rounded-2xl"
									/>
								</div>

								<div className="min-w-0">
									<p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
										{selectedNetwork.name}
									</p>
									<h3 className="mt-2 text-xl font-extrabold text-foreground">
										{selectedNetwork.asset}
									</h3>
									<p className="mt-2 text-sm leading-6 text-muted-foreground">
										{selectedNetwork.note}
									</p>

									<div className="mt-5 rounded-2xl border border-border bg-card p-4">
										<p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
											Wallet address
										</p>
										<p className="mt-2 break-all font-mono text-sm leading-6 text-foreground">
											{selectedNetwork.address}
										</p>
										<Button
											type="button"
											onClick={() => void copyAddress()}
											className="mt-4 h-11 w-full rounded-xl bg-primary font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90"
										>
											{copiedAddress ? (
												<Check className="size-4" />
											) : (
												<Copy className="size-4" />
											)}
											{copiedAddress ? "Copied" : "Copy address"}
										</Button>
									</div>
								</div>
							</div>
						</section>

						<aside className="space-y-6">
							<section className="rounded-3xl border border-border bg-card/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur">
								<div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
									<Heart className="size-6" />
								</div>
								<h2 className="mt-5 text-2xl font-extrabold text-foreground">
									Donate with USD
								</h2>
								<p className="mt-2 text-sm leading-6 text-muted-foreground">
									Use PayPal for international USD donations. You can choose the
									amount directly on PayPal.
								</p>
								<a
									href={paypalUrl}
									target="_blank"
									rel="noreferrer"
									className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/90"
								>
									Donate with PayPal <ExternalLink className="size-4" />
								</a>
							</section>

							<section className="rounded-3xl border border-accent/15 bg-accent/10 p-6 text-foreground">
								<div className="flex gap-3">
									<ShieldCheck className="mt-0.5 size-5 shrink-0" />
									<div>
										<h2 className="font-bold">Thank you for your support</h2>
										<p className="mt-2 text-sm leading-6">
											Every contribution helps cover development, maintenance,
											hosting, and future improvements.
										</p>
									</div>
								</div>
							</section>
						</aside>
					</div>
				</div>
			</section>
		</div>
	);
}
