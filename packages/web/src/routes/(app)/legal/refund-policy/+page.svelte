<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import ContactCard from '$lib/components/ContactCard.svelte';
</script>

<Seo
	title="Refund Policy - ChowBenin"
	description="Learn about ChowBenin's refund policy for food delivery orders."
/>

<div class="prose prose-sm max-w-none">
	<h1 class="text-2xl font-extrabold">Refund Policy</h1>
	<p class="text-text-muted text-sm">Last updated: December 2, 2025</p>

	<section class="mt-8 space-y-6">
		<div>
			<h2 class="text-lg font-bold">1. Overview</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">
				At ChowBenin, we want you to be satisfied with every order. This Refund Policy explains
				when and how you can request a refund for your orders.
			</p>
		</div>

		<div>
			<h2 class="text-lg font-bold">2. Refund Eligibility</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">
				You may be eligible for a refund in the following situations:
			</p>

			<div class="bg-surface mt-4 rounded-lg p-4">
				<h3 class="font-semibold text-green-700">✓ Eligible for Refund</h3>
				<ul class="text-text-body mt-2 list-disc space-y-2 pl-5 text-sm">
					<li>
						<strong>Missing Items:</strong> If items from your order are missing, you will receive a
						refund for those specific items.
					</li>
					<li>
						<strong>Food Quality Issues:</strong> If the food received is spoiled, contaminated, or significantly
						different from what was ordered, and you can provide evidence (photos), you may receive a
						refund.
					</li>
					<li>
						<strong>Order Not Delivered:</strong> If your order was not delivered at all, you will receive
						a full refund.
					</li>
					<li>
						<strong>Wrong Order:</strong> If you received a completely different order than what you
						placed.
					</li>
				</ul>
			</div>

			<div class="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
				<h3 class="font-semibold text-red-700">✗ Not Eligible for Refund</h3>
				<ul class="text-text-body mt-2 list-disc space-y-2 pl-5 text-sm">
					<li>Change of mind after the order has been confirmed</li>
					<li>Incorrect delivery address provided by you</li>
					<li>You were unavailable to receive the delivery</li>
					<li>Taste preferences (e.g., "I didn't like how it tasted")</li>
					<li>Requests made after the 2-hour refund window</li>
					<li>Fraudulent or false claims</li>
				</ul>
			</div>
		</div>

		<div>
			<h2 class="text-lg font-bold">3. Refund Request Timeframe</h2>
			<div class="bg-primary/10 mt-3 rounded-lg p-4">
				<p class="text-text-body text-sm font-semibold">
					⏰ You must request a refund within <strong>2 hours</strong> of receiving your order.
				</p>
			</div>
			<p class="text-text-body mt-3 text-sm leading-relaxed">
				Refund requests made after this 2-hour window will not be processed unless there are
				exceptional circumstances.
			</p>
		</div>

		<div>
			<h2 class="text-lg font-bold">4. How to Request a Refund</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">To request a refund:</p>
			<ol class="text-text-body mt-2 list-decimal space-y-2 pl-5 text-sm">
				<li>
					Contact us via email at
					<a href="mailto:oluwaseyifunmi@mafflle.com" class="text-primary underline"
						>oluwaseyifunmi@mafflle.com</a
					>
				</li>
				<li>Include your order number and the reason for the refund request</li>
				<li>
					Attach photos as evidence if applicable (e.g., missing items, food quality issues)
				</li>
				<li>Submit your request within the 2-hour window</li>
			</ol>
		</div>

		<div>
			<h2 class="text-lg font-bold">5. Order Cancellation</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">You can cancel your order if:</p>
			<ul class="text-text-body mt-2 list-disc space-y-1 pl-5 text-sm">
				<li>
					<strong>Unpaid Orders:</strong> Orders that have not been paid for can be cancelled at any
					time.
				</li>
				<li>
					<strong>Pending Confirmation:</strong> Orders that are still waiting for restaurant confirmation
					can be cancelled.
				</li>
			</ul>
			<p class="text-text-body mt-3 text-sm leading-relaxed">
				Once an order has been confirmed by the restaurant and is being prepared, it cannot be
				cancelled.
			</p>
		</div>

		<div>
			<h2 class="text-lg font-bold">6. Refund Processing</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">
				Once your refund request is approved:
			</p>
			<ul class="text-text-body mt-2 list-disc space-y-1 pl-5 text-sm">
				<li>Refunds will be processed to your original payment method</li>
				<li>Processing time may take 5-10 business days depending on your bank</li>
				<li>You will receive an email confirmation when the refund is processed</li>
			</ul>
		</div>

		<div>
			<h2 class="text-lg font-bold">7. Partial Refunds</h2>
			<p class="text-text-body mt-2 text-sm leading-relaxed">
				In cases where only some items are missing or have issues, we will issue a partial refund
				for those specific items. Delivery and service fees may or may not be refunded depending
				on the nature of the issue.
			</p>
		</div>

		<ContactCard title="8. Contact Us" />
	</section>
</div>
